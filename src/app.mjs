import {scan} from './scan.mjs';import {GROUPS} from './catalog.mjs';import {preview,annotate} from './annotate.mjs';import {EXAMPLE,reportJSON,reportCSV,projectJSON,parseProject} from './files.mjs';
const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
let report=null,page=0;
function message(text,error=false){$('status').textContent=text;$('status').className=error?'error':'';}
function invalidate(){report=null;page=0;$('results').hidden=true;$('annotated').value='';$('preview-count').textContent='';$('records').replaceChildren();$('input-count').textContent=$('source').value.length.toLocaleString()+' / 50,000 UTF-16 units';message('Inputs changed. Inspect again to update the observations.');refreshExports();}
function rows(){
 if(!report)return;const filtered=report.records.filter(r=>$('filter').value==='all'||r.group===$('filter').value),pages=Math.max(1,Math.ceil(filtered.length/25));page=Math.min(page,pages-1);$('records').replaceChildren();
 for(const r of filtered.slice(page*25,(page+1)*25)){
  const tr=el('tr');for(const text of [r.code,r.name,r.group,r.line+':'+r.column,'['+r.utf16Start+', '+r.utf16End+')','['+r.byteStart+', '+r.byteEnd+')',r.codePointIndex])tr.append(el('td','',String(text)));
  const td=el('td'),locate=el('button','','Select');locate.setAttribute('aria-label','Select '+r.code+' at offset '+r.utf16Start);
  locate.addEventListener('click',()=>{const source=$('source');source.focus();source.setSelectionRange(r.utf16Start,r.utf16End);source.scrollIntoView?.({block:'center',behavior:'smooth'});});td.append(locate);tr.append(td);$('records').append(tr);
 }
 $('no-entries').hidden=filtered.length>0;$('page-count').textContent=filtered.length?'Page '+(page+1)+' of '+pages+' · '+filtered.length+' retained entries':'0 retained entries';$('previous').disabled=page===0;$('next').disabled=page>=pages-1;
}
function run(){
 invalidate();
 try{
  report=scan($('source').value,{includeLayout:$('include-layout').checked});const copy=preview($('source').value,{includeLayout:report.includeLayout});
  $('annotated').value=copy.text;$('preview-count').textContent=copy.omittedUnits?'First '+copy.shownUnits+' units · '+copy.omittedUnits+' omitted':'Full input shown';
  $('results').hidden=false;$('badge').textContent=report.hitCount+' observations';$('summary').replaceChildren();
  for(const [value,label] of [[report.codePoints,'code points'],[report.utf16Units,'UTF-16 units'],[report.utf8Bytes,'UTF-8 bytes'],[report.hitCount,'curated observations']]){const block=el('div');block.append(el('strong','',value.toLocaleString()),el('span','',label));$('summary').append(block);}
  $('categories').replaceChildren();for(const group of GROUPS)if(report.counts[group])$('categories').append(el('span','category',group+' · '+report.counts[group]));
  $('coverage').textContent='Counts cover the whole input. '+report.retained+' of '+report.hitCount+' observations are retained for tables and metadata exports; '+report.omitted+' omitted. Filters affect retained entries only. This is not a safety verdict.';
  page=0;rows();message('Inspection complete. No source characters were changed.');
 }catch(error){report=null;$('results').hidden=true;message(error.message,true);}
 refreshExports();
}
const all=el('option','','All categories');all.value='all';$('filter').append(all);for(const group of GROUPS){const o=el('option','',group);o.value=group;$('filter').append(o);}
$('filter').addEventListener('input',()=>{page=0;rows();});$('previous').addEventListener('click',()=>{page--;rows();});$('next').addEventListener('click',()=>{page++;rows();});
for(const id of ['source','include-layout'])$(id).addEventListener('input',invalidate);
$('inspect').addEventListener('click',run);$('example').addEventListener('click',()=>{$('source').value=EXAMPLE;$('include-layout').checked=false;$('filter').value='all';run();});
initializeExports();$('source').value=EXAMPLE;run();

function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type:type+';charset=utf-8',endings:'transparent'})),link=el('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function refreshExports(){if(!$('save-report'))return;for(const id of ['save-report','save-csv','save-annotated','save-project'])$(id).disabled=!report;$('report-preview').value=report?reportJSON(report):'';$('project-preview').value=report?projectJSON($('source').value,report.includeLayout):'';}
function initializeExports(){
 const slot=$('export-slot');
 for(const [id,label,name,type,content] of [
 ['save-report','Metadata JSON ↓','glyphtrail-report.json','application/json',()=>reportJSON(report)],
 ['save-csv','Metadata CSV ↓','glyphtrail-records.csv','text/csv',()=>reportCSV(report)],
 ['save-annotated','Full annotated text ↓','glyphtrail-annotated.txt','text/plain',()=>annotate($('source').value,{includeLayout:report.includeLayout})],
 ['save-project','Editable project ↓','glyphtrail-project.json','application/json',()=>projectJSON($('source').value,report.includeLayout)]]){
  const button=el('button','',label);button.id=id;button.addEventListener('click',()=>{if(report)download(content(),name,type);});slot.append(button);
 }
 slot.append(el('p','help','JSON and CSV include all retained entries, independent of the table filter, and disclose omitted counts. CSV does not include summary counts; use JSON for the full inspection totals. Annotated text covers the full input, including text omitted from the on-screen preview. It is not a reversible encoding or a substitute for your original.'));
 for(const [id,title,label] of [['report-preview','Inspect metadata report JSON','Metadata report JSON'],['project-preview','Inspect editable project JSON','Editable project JSON']]){
  const details=el('details'),summary=el('summary','',title),area=el('textarea');area.id=id;area.readOnly=true;area.setAttribute('aria-label',label);details.append(summary,area);slot.append(details);
 }
 const reopen=el('details'),summary=el('summary','','Reopen a saved inspection'),label=el('label','','Paste Glyphtrail project JSON'),area=el('textarea');area.id='project-input';area.spellcheck=false;label.htmlFor=area.id;
 const load=el('button','','Load pasted project');load.addEventListener('click',()=>{try{const p=parseProject(area.value);$('source').value=p.text;$('include-layout').checked=p.includeLayout;$('filter').value='all';area.value='';run();}catch(error){message(error.message,true);}});reopen.append(summary,label,area,load);slot.append(reopen);
}

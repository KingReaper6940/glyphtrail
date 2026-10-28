import {scan,validate} from './scan.mjs';
export const EXAMPLE='Order\u00a0ready\ncopy\u200bpaste\nEmoji: 👩‍💻 ❤️\nDirection: \u2067abc\u2069\nSoft\u00adhyphen\nBOM: \ufeffend\n';
export const reportJSON=report=>JSON.stringify(report,null,2)+'\n';
export function reportCSV(report){
 const rows=[['code','description','category','utf16_start','utf16_end','byte_start','byte_end','codepoint_index','line','column'],...report.records.map(r=>[r.code,r.name,r.group,r.utf16Start,r.utf16End,r.byteStart,r.byteEnd,r.codePointIndex,r.line,r.column])];
 return rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
}
export function projectJSON(text,includeLayout){validate(text);if(typeof includeLayout!=='boolean')throw new Error('Choose layout inspection on or off.');return JSON.stringify({format:'glyphtrail-project-v1',text,includeLayout},null,2)+'\n';}
export function parseProject(text){
 if(typeof text!=='string'||text.length>500000)throw new Error('Project JSON must be at most 500,000 UTF-16 units.');
 let p;try{p=JSON.parse(text);}catch{throw new Error('Project is not valid JSON.');}
 if(p?.format!=='glyphtrail-project-v1')throw new Error('Not a Glyphtrail project.');projectJSON(p.text,p.includeLayout);return {text:p.text,includeLayout:p.includeLayout};
}
export function inspectProject(project){const p=parseProject(project);return scan(p.text,{includeLayout:p.includeLayout});}

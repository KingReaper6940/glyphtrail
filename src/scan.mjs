import {classify,GROUPS} from './catalog.mjs';
export const MAX_INPUT=50000,MAX_RECORDS=1000;
export function validate(text){if(typeof text!=='string'||text.length>MAX_INPUT)throw new Error('Use text up to 50,000 UTF-16 units.');for(const char of text){const cp=char.codePointAt(0);if(cp>=0xd800&&cp<=0xdfff)throw new Error('Replace unpaired UTF-16 surrogates before inspecting.');}return text;}
export function scan(text,{includeLayout=false}={}){
 validate(text);if(typeof includeLayout!=='boolean')throw new Error('Choose whether to include ordinary layout characters.');
 const records=[],counts=Object.fromEntries(GROUPS.map(group=>[group,0]));let utf16=0,byte=0,index=0,line=1,column=1,total=0;
 const encoder=new TextEncoder();
 for(const char of text){const cp=char.codePointAt(0),bytes=encoder.encode(char).length,hit=classify(cp,includeLayout);
  if(hit){counts[hit.group]++;total++;if(records.length<MAX_RECORDS)records.push({...hit,utf16Start:utf16,utf16End:utf16+char.length,byteStart:byte,byteEnd:byte+bytes,codePointIndex:index,line,column});}
  if(cp===10||cp===0x2028||cp===0x2029||(cp===13&&text[utf16+1]!=='\n')){line++;column=1;}else column++;
  utf16+=char.length;byte+=bytes;index++;
 }
 return {format:'glyphtrail-report-v1',includeLayout,utf16Units:text.length,utf8Bytes:byte,codePoints:index,lines:line,hitCount:total,retained:records.length,omitted:total-records.length,counts,records};
}

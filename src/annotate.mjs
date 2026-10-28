import {validate} from './scan.mjs';import {classify} from './catalog.mjs';
export function annotate(text,{includeLayout=false}={}){
 validate(text);if(typeof includeLayout!=='boolean')throw new Error('Choose whether to include ordinary layout characters.');
 let output='';for(let i=0;i<text.length;){const cp=text.codePointAt(i),char=String.fromCodePoint(cp),hit=classify(cp,includeLayout);
  if(includeLayout&&char==='\r'&&text[i+1]==='\n'){output+='⟦U+000D⟧⟦U+000A⟧\r\n';i+=2;continue;}
  output+=hit?'⟦'+hit.code+'⟧'+(['\n','\r','\u2028','\u2029'].includes(char)?char:''):char;i+=char.length;
 }return output;
}
export function preview(text,options){
 validate(text);let end=Math.min(4000,text.length);const last=text.charCodeAt(end-1);if(end<text.length&&last>=0xd800&&last<=0xdbff)end--;
 return {text:annotate(text.slice(0,end),options),shownUnits:end,omittedUnits:text.length-end};
}

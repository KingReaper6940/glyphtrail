import {validate} from './scan.mjs';import {classify} from './catalog.mjs';
export function annotate(text,{includeLayout=false}={}){
 validate(text);if(typeof includeLayout!=='boolean')throw new Error('Choose whether to include ordinary layout characters.');
 let output='';for(const char of text){const hit=classify(char.codePointAt(0),includeLayout);output+=hit?'⟦'+hit.code+'⟧'+(char==='\n'?'\n':char==='\r'?'\r':''):char;}return output;
}
export function preview(text,options){
 validate(text);let end=Math.min(4000,text.length);const last=text.charCodeAt(end-1);if(end<text.length&&last>=0xd800&&last<=0xdbff)end--;
 return {text:annotate(text.slice(0,end),options),shownUnits:end,omittedUnits:text.length-end};
}

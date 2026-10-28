export const GROUPS=['zero-width','joiner','bidi','space','selector','tag','control','layout'];
const points=new Map([
 [0x00a0,['space','No-break space']],[0x00ad,['zero-width','Soft hyphen']],[0x061c,['bidi','Arabic letter mark']],
 [0x1680,['space','Ogham space mark']],[0x200b,['zero-width','Zero-width space']],
 [0x200c,['joiner','Zero-width non-joiner']],[0x200d,['joiner','Zero-width joiner']],
 [0x200e,['bidi','Left-to-right mark']],[0x200f,['bidi','Right-to-left mark']],
 [0x202a,['bidi','Left-to-right embedding']],[0x202b,['bidi','Right-to-left embedding']],[0x202c,['bidi','Pop directional formatting']],
 [0x202d,['bidi','Left-to-right override']],[0x202e,['bidi','Right-to-left override']],
 [0x202f,['space','Narrow no-break space']],[0x205f,['space','Medium mathematical space']],
 [0x2060,['zero-width','Word joiner']],[0x2066,['bidi','Left-to-right isolate']],[0x2067,['bidi','Right-to-left isolate']],
 [0x2068,['bidi','First strong isolate']],[0x2069,['bidi','Pop directional isolate']],
 [0x3000,['space','Ideographic space']],[0xfeff,['zero-width','Byte-order mark / zero-width no-break space']]
]);
export const code=cp=>'U+'+cp.toString(16).toUpperCase().padStart(4,'0');
export function classify(cp,includeLayout=false){
 let hit=points.get(cp);
 if(!hit&&cp>=0x2000&&cp<=0x200a)hit=['space','Typographic space'];
 if(!hit&&cp>=0x2061&&cp<=0x2064)hit=['zero-width','Invisible mathematical operator'];
 if(!hit&&((cp>=0xfe00&&cp<=0xfe0f)||(cp>=0xe0100&&cp<=0xe01ef)))hit=['selector','Variation selector'];
 if(!hit&&cp>=0xe0000&&cp<=0xe007f)hit=['tag','Tag-range code point'];
 if(!hit&&((cp<0x20&&![9,10,13].includes(cp))||(cp>=0x7f&&cp<=0x9f)))hit=['control','Control code'];
 if(!hit&&includeLayout&&[9,10,13,32].includes(cp))hit=['layout',({9:'Tab',10:'Line feed',13:'Carriage return',32:'Ordinary space'})[cp]];
 return hit?{group:hit[0],name:hit[1],code:code(cp)}:null;
}

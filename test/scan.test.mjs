import test from 'node:test';import assert from 'node:assert/strict';import {classify} from '../src/catalog.mjs';import {scan} from '../src/scan.mjs';
test('ASCII without selected layout characters has no curated hits',()=>{const r=scan('hello world\n');assert.equal(r.hitCount,0);assert.equal(r.lines,2);});
test('UTF-16, byte and code-point offsets diverge correctly after emoji',()=>{const r=scan('🙂\u200bA');const hit=r.records[0];assert.deepEqual([hit.utf16Start,hit.byteStart,hit.codePointIndex,hit.line,hit.column],[2,4,1,1,2]);assert.equal(r.utf8Bytes,8);});
test('CRLF counts as one line break with code-point columns',()=>{const r=scan('A\r\n\u00a0B\rC\n',{includeLayout:true});assert.equal(r.lines,4);const nbsp=r.records.find(p=>p.code==='U+00A0');assert.equal(nbsp.line,2);assert.equal(nbsp.column,1);assert.equal(r.records.find(p=>p.code==='U+000A').line,1);});
test('joiners and selectors are reported without being treated as errors',()=>{const r=scan('👩‍💻 ❤️');assert.equal(r.counts.joiner,1);assert.equal(r.counts.selector,1);assert.equal(classify(0xe0061).group,'tag');});
test('retention is explicit while totals cover the whole input',()=>{const r=scan('\u200b'.repeat(1200));assert.equal(r.hitCount,1200);assert.equal(r.retained,1000);assert.equal(r.omitted,200);assert.equal(r.counts['zero-width'],1200);});
test('invalid and excessive inputs fail before inspection',()=>{assert.throws(()=>scan('a'.repeat(50001)));assert.throws(()=>scan('\ud800'));assert.throws(()=>scan('x',{includeLayout:'yes'}));});

import {annotate,preview} from '../src/annotate.mjs';
test('annotation exposes selected code points without changing the source string',()=>{const source='A\u200bB\u00a0C';assert.equal(annotate(source),'A⟦U+200B⟧B⟦U+00A0⟧C');assert.equal(source,'A\u200bB\u00a0C');assert.equal(annotate('A B\n'),'A B\n');});
test('ordinary layout annotation preserves actual line breaks',()=>{assert.equal(annotate('A\tB\n',{includeLayout:true}),'A⟦U+0009⟧B⟦U+000A⟧\n');});
test('preview discloses truncation and never cuts a surrogate pair',()=>{const r=preview('a'.repeat(3999)+'🙂B');assert.equal(r.shownUnits,3999);assert.equal(r.omittedUnits,3);assert.equal(r.text,'a'.repeat(3999));});

test('Unicode separators advance line positions and CRLF annotation stays one break',()=>{const r=scan('A\u2028\u200b\u2029\u00a0');assert.equal(r.lines,3);assert.equal(r.records.find(x=>x.code==='U+200B').line,2);assert.equal(r.records.find(x=>x.code==='U+00A0').line,3);assert.equal(annotate('A\r\nB',{includeLayout:true}),'A⟦U+000D⟧⟦U+000A⟧\r\nB');});
test('48 mixed strings agree with independent prefix byte measurements',()=>{
 const choices=['a','🙂','界','\u200b','\u2067','\u00a0','\n','\u200d','\ufe0f'];let seed=73;
 for(let run=0;run<48;run++){let source='';for(let i=0;i<80;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;source+=choices[seed%choices.length];}const r=scan(source);
 assert.equal(r.utf8Bytes,new TextEncoder().encode(source).length);assert.equal(r.codePoints,Array.from(source).length);assert.equal(Object.values(r.counts).reduce((a,b)=>a+b,0),r.hitCount);
 for(const hit of r.records){assert.equal(new TextEncoder().encode(source.slice(0,hit.utf16Start)).length,hit.byteStart);assert.equal(Array.from(source.slice(0,hit.utf16Start)).length,hit.codePointIndex);assert.equal(source.codePointAt(hit.utf16Start).toString(16).toUpperCase().padStart(4,'0'),hit.code.slice(2));}}
});

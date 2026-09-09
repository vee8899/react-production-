import fs from 'node:fs/promises';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('C:/Users/vee/.codex/skills/artifact-template-prime-state-systems/assets/reference.pptx'));
await fs.writeFile('.presentation-build/reference.json',JSON.stringify(p.toProto(),null,2));
console.log((await p.inspect({kind:'slide,textbox,shape',maxChars:25000})).ndjson);
console.log(p.help('slides',{include:['index','notes'],maxChars:5000}));
for(let i of [0,2,5]) { const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(`.presentation-build/ref-${i}.png`,new Uint8Array(await b.arrayBuffer())); }

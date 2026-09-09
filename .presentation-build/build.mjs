import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {finalizePresentation} from 'file:///C:/Users/vee/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='C:/Users/vee/source/repos/react_production_alpha';
const skill='C:/Users/vee/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const proto=JSON.parse(await fs.readFile(root+'/.presentation-build/reference.json','utf8'));
proto.slides=[proto.slides[0],proto.slides[2],proto.slides[5]];proto.slides.forEach((s,i)=>s.index=i);
const p=Presentation.load(proto);
for(const s of p.slides.items)for(const sh of s.shapes.items)if(sh.text)sh.text.style={typeface:'Arial'};
function edit(id,text,size,box,font='Arial',color){let s=p.resolve('sh/'+id);s.text=text;s.text.style={typeface:font,fontSize:size,autoFit:'none',...(color?{color}:{}),bold:false};if(box)s.position=box;return s;}
const B=(left,top,width,height)=>({left,top,width,height});
edit('1cvuxc7e','PRIME STATE SYSTEMS',13,B(72,36,550,28));
edit('k3yl0zql','A consistent way\nto run repeatable\nbusiness operations',48,B(72,152,700,205),'Georgia');
edit('7qp4be9c','Research-informed processes, configured around your business and delivered through managed workflows—with visibility into execution and exceptions.',22,B(76,399,610,150));
edit('sryl4zqx','PRIME STATE',13);
edit('fu94fe98','Workflow visibility',25,B(826,235,280,40),'Georgia');
edit('utg3698n','ILLUSTRATIVE VIEW',12,B(826,288,260,22));
edit('hofulsf2','Lead capture',16,B(826,330,170,30)); edit('ul4vaxgb','Recorded',16,B(995,330,115,30), 'Arial','#526859');
edit('4r6dg7et','Qualification',16,B(826,382,170,30)); edit('5sfepcfe','Assigned',16,B(995,382,115,30));
edit('3qxwn2x8','Follow-up',16,B(826,434,160,30)); edit('sfqdkrep','Review',16,B(995,434,115,30),'Arial','#986A45');
for(const [id,y] of [['wn6dc7eh',320],['vmdcj2xw',372],['ipovexwn',424]])p.resolve('sh/'+id).position=B(824,y,278,1);
edit('dgzetcfa','PREPRODUCTION PREVIEW  /  SEPTEMBER 2026',12,B(76,632,650,25));
edit('e10f2twf','PRIME STATE SYSTEMS',13);edit('cza94vmx','02',13);
edit('d0jax03i','ILLUSTRATIVE WORKFLOW',13);
edit('298ryl4v','A defined process for every new lead',43,B(72,142,1120,85),'Georgia');
edit('obq90bml','01',16);edit('pcjqtg36','Capture',30,B(72,344,290,48),'Georgia');
edit('n6ls3alk','Record the enquiry and remove duplicates before the handoff.',21,B(72,448,310,110));
edit('n2l4fq98','02',16);edit('m1c3mlsn','Qualify & assign',30,B(448,344,340,48),'Georgia');
edit('83ulovat','Apply agreed criteria and route the lead to a named owner.',21,B(448,448,310,110));
edit('v6l4jq94','03',16);edit('a5c3ql8z','Track follow-up',30,B(824,344,340,48),'Georgia');
edit('w7ulsvqp','Record the outcome and make exceptions visible for review.',21,B(824,448,310,110));
edit('i9w3u58v','The operating view: what ran, what changed, and what needs attention.',20,B(72,613,1120,45));
edit('oryp8fah','PRIME STATE SYSTEMS  /  PROPOSED PILOT',13,B(72,36,700,28),'Arial','#BDB7AE');edit('yhg7epsj','03',13,undefined,'Arial','#BDB7AE');
edit('zi98nu94','Begin with one\nimportant workflow',49,B(72,152,760,155),'Georgia');
edit('87ipkzal','Define the process, connect the required systems, and evaluate execution before expanding the scope.',23,B(76,350,590,115),'Arial','#E0DDDA');
p.resolve('sh/98rqt4r6').position=B(76,520,480,56);
edit('ml07i9sv','AGREE THE FIRST WORKFLOW',17,B(96,532,440,32),'Arial','#0F0E0D');
edit('7m98ru9g','PREPRODUCTION  /  SCOPE AND SUCCESS CRITERIA TO BE AGREED',12,B(76,638,1000,25),'Arial','#D8CFC1');
function add(text,y,size=21,color='#FEFDFC'){const s=p.slides.items[2].shapes.add({geometry:'textbox',position:B(850,y,330,100),fill:'none',line:{fill:'none',width:0}});s.text=text;s.text.style={typeface:'Arial',fontSize:size,color,autoFit:'none'};}
add('PILOT EVALUATION',170,13,'#BDB7AE');add('Process agreed\nRules, ownership, exceptions',221);add('Execution observed\nActivity and audit history',336);add('Results reviewed\nBaseline and pilot comparison',451);
p.slides.items[0].speakerNotes.textFrame.setText('Sources: user product description, September 2026; repository README.md; src/pages/HomePage.tsx; src/pages/DashboardPage.tsx. Preproduction concept. Illustrative workflow view is editable presentation artwork, not a live screenshot or evidence of performance. Research-informed describes the intended process design approach; no specific study or validated outcome is claimed.');
p.slides.items[1].speakerNotes.textFrame.setText('Source: src/pages/HomePage.tsx workflow example: capture, deduplicate, route, follow up, and record the outcome. This is an illustrative configured workflow, not a claim that this client deployment is live. Qualification criteria, owners, timing and exception handling would be agreed during scoping.');
p.slides.items[2].speakerNotes.textFrame.setText('Proposed next step, not an agreed commercial commitment. Product is in preproduction per user. Pilot scope, integration access, process rules, baseline, success criteria, and launch validation remain to be agreed.');
const candidate=root+'/.presentation-build/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:root+'/outputs/presentations/Prime-State-Systems-Preproduction.pptx',pythonExecutable:'C:/Users/vee/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:3,fontPolicy:{basis:'design',families:['Arial','Georgia']},verifyArtifactToolImport:true,receiptPath:root+'/.presentation-build/validation.json'});
for(let i=0;i<3;i++){const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(root+`/.presentation-build/slide-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
console.log('DONE');


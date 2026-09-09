import fs from 'node:fs/promises';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
import {finalizePresentation} from 'file:///C:/Users/vee/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='C:/Users/vee/source/repos/react_production_alpha';
const skill='C:/Users/vee/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const old=await PresentationFile.importPptx(await FileBlob.load(root+'/outputs/presentations/Prime-State-Systems-Preproduction.pptx'));
const proto=old.toProto();proto.slides[1].elements=[];
const p=Presentation.load(proto),s=p.slides.items[1];
const B=(left,top,width,height)=>({left,top,width,height});
function shape(g,name,b,fill,line='none'){return s.shapes.add({geometry:g,name,position:b,fill,line:{fill:line,width:line==='none'?0:1}});}
function text(name,t,b,size=20,font='Arial',color='#0F0E0D'){const z=shape('textbox',name,b,'none');z.text=t;z.text.style={fontSize:size,typeface:font,color,autoFit:'none',bold:false};return z;}
text('brand','PRIME STATE SYSTEMS',B(72,36,600,30),13,'Arial','#6B6762');text('page','02',B(1150,36,58,30),13,'Arial','#6B6762');
text('label','PROPOSED CLIENT JOURNEY',B(72,98,700,30),13,'Arial','#526859');
text('title','A defined process for every new client',B(72,136,1136,75),43,'Georgia');
text('subtitle','From the first conversation to managed automation',B(72,205,1100,35),21,'Arial','#6B6762');
const nodes=[
[72,274,'01','Initial conversation','Understand the business, priorities\nand operational bottlenecks.'],
[472,274,'02','Process & scope','Map the workflow and agree\nownership and success criteria.'],
[872,274,'03','Client onboarding','Set up access, connect systems\nand confirm the required data.'],
[872,465,'04','Automation setup','Configure rules, approvals\nand exception handling.'],
[472,465,'05','Test & approve','Validate with sample cases;\nreview and approve the pilot.'],
[72,465,'06','Operate & improve','Monitor activity, resolve issues\nand refine the workflow.']];
for(const [x,y,n,title,body] of nodes){shape('rect','stage-'+n,B(x,y,336,138),'#F2F0ED','#E0DDDA');text('number-'+n,n,B(x+16,y+12,50,24),13,'Arial','#526859');text('stage-title-'+n,title,B(x+16,y+39,309,40),26,'Georgia');text('stage-body-'+n,body,B(x+16,y+83,312,52),18,'Arial','#6B6762');}
for(const x of [422,822])shape('rightArrow','flow-forward-'+x,B(x,329,36,18),'#526859');
shape('downArrow','flow-onboard-build',B(1031,424,18,29),'#526859');
for(const x of [422,822])shape('leftArrow','flow-continue-'+x,B(x,520,36,18),'#526859');
text('footer','PREPRODUCTION  /  The scope and launch criteria are agreed before the pilot begins.',B(72,643,1136,32),13,'Arial','#6B6762');
s.speakerNotes.textFrame.setText('Proposed client engagement journey, based on the user request and repository src/pages/HomePage.tsx: platform, implementation, and ongoing operations. This describes a proposed process, not a completed client engagement or evidence of production readiness. Initial communication is followed by process scoping, onboarding, workflow configuration, testing and approval, then ongoing monitoring and improvement. Timelines, scope, access and success criteria require agreement. Every stage and arrow is a native editable PowerPoint shape.');
const candidate=root+'/.presentation-build/journey-candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:root+'/outputs/presentations/Prime-State-Systems-Client-Journey.pptx',pythonExecutable:'C:/Users/vee/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:3,fontPolicy:{basis:'design',families:['Arial','Georgia']},verifyArtifactToolImport:true,receiptPath:root+'/.presentation-build/journey-validation.json'});
for(let i=0;i<3;i++){const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(root+`/.presentation-build/journey-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}

import fs from 'node:fs/promises';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
import {finalizePresentation} from 'file:///C:/Users/vee/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='C:/Users/vee/source/repos/react_production_alpha', skill='C:/Users/vee/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const version=process.argv[2]||'v1';
const source=await PresentationFile.importPptx(await FileBlob.load(root+'/outputs/presentations/Prime-State-Systems-Reviewed-v3.pptx'));
const proto=source.toProto();for(const s of proto.slides)s.elements=[];const p=Presentation.load(proto);while(p.slides.items.length<8)p.slides.add();
const C={bg:'#FEFDFC',ink:'#171916',muted:'#666B63',line:'#DADCD5',green:'#42594A',pale:'#EEF1E9',dark:'#18231D',white:'#F8F7F2',light:'#C4CDC2'};
const B=(left,top,width,height)=>({left,top,width,height});
function box(s,name,x,y,w,h,fill=C.pale,line='none',g='rect'){return s.shapes.add({geometry:g,name,position:B(x,y,w,h),fill,line:{fill:line,width:line==='none'?0:1}});}
function tx(s,name,t,x,y,w,h,size=20,color=C.ink,font='Arial',bold=false){let z=box(s,name,x,y,w,h,'none');z.text=t;z.text.style={typeface:font,fontSize:size,color,bold,autoFit:'none'};return z;}
function rule(s,x,y,w,color=C.line){box(s,'rule',x,y,w,1,color);}
function arrow(s,x,y,w=32,h=18,g='rightArrow',color=C.green){box(s,'sequence',x,y,w,h,color,'none',g);}
function label(s,t,x,y,w=600,color=C.green){tx(s,t,t,x,y,w,25,13,color);}
function base(i,section,title,sub,{dark=false}={}){let s=p.slides.items[i];s.background.fill=dark?C.dark:C.bg;let ink=dark?C.white:C.ink,muted=dark?C.light:C.muted;label(s,'PRIME STATE SYSTEMS',56,27,560,muted);label(s,`${String(i+1).padStart(2,'0')} / ${section.toUpperCase()}`,930,27,310,muted);tx(s,'headline',title,56,80,1168,63,40,ink,'Georgia');if(sub)tx(s,'subhead',sub,56,155,1150,57,21,muted);rule(s,56,226,1168,dark?'#455247':C.line);label(s,'PREPRODUCTION  /  SEPTEMBER 2026',56,681,750,muted);return s;}
function note(s,t){s.speakerNotes.textFrame.setText(t+'\nProduct is in preproduction. Proposed service and pilot requirements need client agreement. No measured commercial result or production readiness is asserted.');}
function table(s,name,values,x,y,w,h,widths,dark=false){let t=s.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,columnWidths:widths,values});t.styleOptions={headerRow:false,bandedRows:false};t.borders.assign({fill:dark?'#455247':C.line,width:0.7,style:'solid'});for(let r=0;r<values.length;r++)for(let c=0;c<values[0].length;c++){let a=t.getCell(r,c);a.fill=r===0?(dark?'#2D4033':C.green):(dark?C.dark:C.bg);a.text.style={typeface:'Arial',fontSize:r===0?15:19,color:r===0?C.white:(dark?C.white:C.ink),bold:r===0};}return t;}
// 1 — informative opening spread
let s=p.slides.items[0];s.background.fill=C.bg;
s.images.add({blob:new Uint8Array(await fs.readFile(root+'/.presentation-build/editorial-art.png')),contentType:'image/png',alt:'Abstract paper and limestone channels converging into an ordered route; generated editorial artwork',fit:'cover',position:B(820,0,460,720)});
label(s,'PRIME STATE SYSTEMS',56,30,700);label(s,'01 / PRODUCT BRIEF',56,76,600,C.muted);
tx(s,'thesis','A consistent way\nto run the business',56,135,745,142,51,C.ink,'Georgia');
tx(s,'thesis-detail','A platform for managed workflows that standardize repeatable operations and put research-informed processes into practice.',56,302,695,83,24,C.muted);
const facts=[['DESIGN','Agree the process, rules and exceptions.'],['AUTOMATE','Connect the systems and execute the workflow.'],['REVIEW','See what ran, what changed and what needs attention.']];facts.forEach(([a,b],i)=>{let y=420+i*66;rule(s,56,y,705);label(s,a,56,y+16,140);tx(s,'fact'+i,b,209,y+12,550,51,20);});
label(s,'PREPRODUCTION  /  CLIENT DISCUSSION',56,681,745,C.muted);
note(s,'Sources: user product description; src/pages/HomePage.tsx. The opening artwork is AI-generated using the built-in image tool, an abstract process metaphor, not product evidence. Prompt: ivory paper and pale limestone architectural channels converging into one route, forest-green strip, museum still-life photography, no text or logos. Asset: .presentation-build/editorial-art.png.');
// 2 — friction/response alignment
s=base(1,'operating problem','Where repeatable work loses consistency','Illustrative business pipeline: the weak point is often the handoff between people, records and systems.');
const stageX=[56,359,662,965];['Enquiry received','Work assigned','Service delivered','Outcome recorded'].forEach((t,i)=>{tx(s,'pipe'+i,t,stageX[i],255,255,42,26,C.ink,'Georgia');if(i<3)arrow(s,stageX[i]+258,268,31,15);});
rule(s,56,325,1168);
const friction=[['01','Inconsistent handoffs','Ownership, timing and approval rules depend on memory.','Define the owner, due action and approval path.'],['02','Disconnected records','The same information is copied across tools and loses context.','Map fields, identify duplicates and preserve references.'],['03','Unowned exceptions','A failed step is visible too late or reaches nobody responsible.','Record failures and assign a review path.']];
friction.forEach(([n,h,b,r],i)=>{let x=56+i*399;tx(s,'n'+i,n,x,348,92,70,42,C.green,'Georgia');tx(s,'friction'+i,h,x+96,354,278,65,25,C.ink,'Georgia');tx(s,'cause'+i,b,x,429,353,77,21,C.muted);rule(s,x,529,353);label(s,'OPERATIONAL RESPONSE',x,545,355);tx(s,'response'+i,r,x,578,353,70,21);});
note(s,'Source: src/pages/HomePage.tsx problem list and workflow examples. Pipeline and friction points are illustrative, not a diagnosis of this client.');
// 3 — layered system model + managed service contrast
s=base(2,'product model','One layer for execution and oversight','Client systems supply the inputs. Configured workflows perform the work. The portal makes execution inspectable.');
const layers=[['OPERATING VIEW','Workflow history · status · records · steps · investigation notes',258,C.dark,C.white],['CONFIGURED WORKFLOWS','Rules · routing · approvals · failure paths · reported outcomes',398,C.pale,C.ink],['CLIENT SYSTEMS','Existing CRM, forms, spreadsheets and document providers',538,'#F1EEE8',C.ink]];
layers.forEach(([h,b,y,fill,ink])=>{box(s,h,56,y,764,102,fill);label(s,h,79,y+16,700,ink===C.white?C.light:C.green);tx(s,'layer-'+h,b,79,y+48,707,44,21,ink);});
arrow(s,425,369,21,22,'upArrow');arrow(s,425,509,21,22,'upArrow');
label(s,'THE MANAGED SERVICE',867,257,355);tx(s,'service-head','The platform has\nan operating owner',867,295,340,79,29,C.ink,'Georgia');
[['Before the pilot','Map the process; configure and test integrations.'],['During operation','Monitor execution and investigate exceptions.'],['At review','Assess outcomes and agree refinements.']].forEach(([a,b],i)=>{let y=398+i*83;tx(s,'service-'+i,a,867,y,335,27,18,C.green,'Arial',true);tx(s,'serviced-'+i,b,867,y+29,335,53,19,C.muted);});
note(s,'Sources: README.md architecture; src/pages/HomePage.tsx service model; src/pages/WorkflowsPage.tsx; src/components/dashboard/RunDetail.tsx. Native editable conceptual model. Client systems and provider connections are subject to scope; the diagram is not a deployment guarantee.');
// 4 — client journey, including ownership and gate
s=base(3,'client journey','A defined process for every new client','The proposed engagement establishes scope, access and accountability before the client approves a pilot launch.');
const nodes=[['Conversation','Identify the operational priority.','Priority + named owner','Client + Prime State'],['Process & scope','Map rules, handoffs and measures.','Scope + acceptance criteria','Joint agreement'],['Onboarding','Confirm access, data and contacts.','Access + data checklist','Client; Prime State supports'],['Automation setup','Configure rules and integrations.','Workflow ready for testing','Prime State'],['Test & approve','Test cases; client approves launch.','Client launch approval','Prime State tests; client approves'],['Operate & improve','Monitor runs and review issues.','Review cadence + refinements','Prime State; joint review']];
const coords=[[56,246],[456,246],[856,246],[856,461],[456,461],[56,461]];
nodes.forEach(([h,b,o,owner],i)=>{let [x,y]=coords[i],gate=i===4,ink=gate?C.white:C.ink;box(s,'stage'+i,x,y,368,195,gate?C.dark:C.pale,gate?C.dark:C.line);tx(s,'stitle'+i,`${String(i+1).padStart(2,'0')}  ${h}`,x+16,y+11,340,38,25,ink,'Georgia');tx(s,'action'+i,b,x+16,y+58,335,48,20,gate?C.light:C.muted);tx(s,'out'+i,'OUTPUT  '+o,x+16,y+118,335,36,16,gate?C.white:C.green);tx(s,'owner'+i,owner,x+16,y+162,335,25,14,gate?C.light:C.muted);});
for(let x of [427,827]){arrow(s,x,330,25,18);arrow(s,x,545,25,18,'leftArrow');}arrow(s,1030,444,19,14,'downArrow');
note(s,'Proposed engagement flow based on the user request and HomePage.tsx. Outputs and responsibilities are proposed. Native editable flowchart. The dark node is the client approval gate, not a claim that a launch has occurred.');
// 5 — end-to-end workflow with branch conditions
s=base(4,'workflow example','Document automation, including the exceptions','Define the template, source fields and approval conditions before generation begins.');
const steps=[['01','Template','Version and\ndocument type.'],['02','Source','Approved fields\nand records.'],['03','Validate','Conditions and\nrequired fields.'],['04','Approve','Agreed approval\nmode.'],['05','Generate','Configured\nprovider adapter.'],['06','Record result','Output reference\nand run status.']];
steps.forEach(([n,h,b],i)=>{let x=56+i*199;box(s,'document-step'+i,x,258,173,154,C.pale,C.line);label(s,n,x+12,266,60);tx(s,'doc-head'+i,h,x+12,297,158,37,21,C.ink,'Georgia');tx(s,'doc-detail'+i,b,x+12,346,152,65,17,C.muted);if(i<5)arrow(s,x+177,315,18,13);});
arrow(s,529,416,18,36,'downArrow');box(s,'approval-stem',737,412,1,28,C.green);
box(s,'missing-branch',454,462,365,109,'#F3EEE6');label(s,'MISSING REQUIRED DATA',469,471,334,'#8B613F');tx(s,'missing-action','Fail safely; correct the source data\nbefore trying again.',469,504,333,55,20);
box(s,'approval-branch',854,462,368,109,'#F3EEE6');label(s,'APPROVAL NOT GRANTED',869,471,336,'#8B613F');tx(s,'approval-action','Proposed handling: revise;\nkeep generation blocked.',869,504,339,55,20);
// route approval branch to its note, with clear label rather than ambiguous diagonal
box(s,'approval-route',737,440,300,1,C.green);box(s,'approval-route-down',1036,440,1,15,C.green);arrow(s,1028,451,18,9,'downArrow');
label(s,'CONFIGURATION DECISIONS',56,463,367);tx(s,'decisions','Template and version\nField mapping and conditions\nApproval mode and provider',56,498,367,86,21,C.muted);
rule(s,56,584,1168);tx(s,'recording','Execution evidence: workflow steps, entity references and status are reported to the operating layer.',56,606,1140,53,21);
note(s,'Source: n8n/workflows/document-automation/README.md. Contract sequence: select versioned template; map approved fields; evaluate conditions (missing fields fail safely); route approval; generate via provider adapter; store output reference/format; report workflow steps/entity refs/status. Return-for-revision on rejected approval is a proposed configuration decision, not verified runtime behavior. No actual document or client record shown.');
// 6 — editable operating record schematic
s=base(5,'operating view','Inspect the run, then decide what needs attention','An illustrative run shows how an operator can identify a failure and choose a response. All values are sample data.');
box(s,'record-shell',56,249,769,390,'#F3F2ED',C.line);label(s,'ILLUSTRATIVE EXECUTION RECORD',76,263,700);
tx(s,'record-name','Document generation',76,299,570,43,30,C.ink,'Georgia');tx(s,'status','FAILED',658,307,150,33,18,'#976039',undefined,true);
[['Processed','0'],['Failed records','1'],['Retries','0'],['Duration','0.8 s']].forEach(([a,b],i)=>{let x=76+i*184;label(s,a.toUpperCase(),x,361,175,C.muted);tx(s,'metric'+i,b,x,393,173,43,31,C.ink,'Georgia');});
table(s,'steps',[['EXECUTION STEP','STATUS','INVESTIGATION NOTE'],['Required fields','Failed','Missing required source field'],['Generation','Not reached','Input validation stopped the run']],76,463,730,141,[227,150,353]);
const annotations=[['01  Locate the issue','Status and execution steps identify where the run stopped.'],['02  Assess the extent','Record counts, duration and retries give context for investigation.'],['03  Choose the response','Use the investigation note to resolve the issue through the agreed process.']];
annotations.forEach(([h,b],i)=>{let y=262+i*131;label(s,h,869,y,340);tx(s,'annotation'+i,b,869,y+37,335,80,22,C.muted);});
note(s,'Fields grounded in src/components/dashboard/RunDetail.tsx: status, start/finish, duration, retries, processed/failed records, event reference, execution steps and investigation note. All shown values are invented illustrative examples, not performance claims or live records. The simplified schematic is native editable content, not an exact interface reproduction. Not reached is an explanatory schematic label.');
// 7 — decision matrix
s=base(6,'pilot evidence','Judge the pilot against agreed evidence','Start with the current baseline. Set acceptance thresholds before testing, then review the same measures at the pilot decision.',{dark:true});
table(s,'pilot-matrix',[
['REQUIREMENT','EVIDENCE TO REVIEW','PROPOSED OWNER','DECISION'],
['Scope','Workflow, systems, exclusions\nand acceptance criteria','Client + Prime State','Ready to configure?'],
['Readiness','Approved sample data, access\nand exception ownership','Client; Prime State\nchecks','Ready to test?'],
['Validation','Normal, duplicate, missing-data\nand failure cases','Prime State tests;\nclient reviews','Approve pilot launch?'],
['Evaluation','Baseline vs pilot: completion,\nhandling time, manual work','Joint review','Refine or expand?']
],56,258,1168,332,[186,441,270,271],true);
label(s,'SUCCESS THRESHOLDS ARE AGREED, NOT ASSUMED',56,611,1168,C.light);tx(s,'criteria','Record the measurement method, observation period and approval owner in the pilot specification.',56,643,1150,30,20,C.white);
note(s,'Proposed pilot evidence matrix. No numerical target or business benefit is asserted. Metrics are suggestions to scope with the client, and may require measurement outside the portal. Native editable table.');
// 8 — concrete engagement brief with strong closing composition
s=base(7,'engagement brief','Choose one workflow worth standardizing','A proposed first engagement with explicit responsibilities and a defined decision before wider rollout.');
box(s,'scope-field',56,252,373,400,C.dark);label(s,'PROPOSED STARTING SCOPE',78,273,327,C.light);tx(s,'scope-statement','One workflow.\nA named owner.\nAn agreed test.',78,324,328,147,36,C.white,'Georgia');tx(s,'scope-description','Confirm the connected systems, required records, exclusions and approval conditions before implementation begins.',78,493,321,118,22,C.light);
const brief=[['CLIENT INPUTS','Nominate an operational owner; identify the workflow; provide approved access and sample data.'],['PRIME STATE RESPONSIBILITIES','Map the process, configure the workflow, test execution and propose the operating review cadence.'],['DECISIONS TO AGREE','Scope, success measures, approval rights, timeline, support responsibilities and commercial terms.']];
brief.forEach(([h,b],i)=>{let y=256+i*124;label(s,h,477,y,732);tx(s,'brief'+i,b,477,y+34,713,76,23,C.muted);if(i<2)rule(s,477,y+111,747);});
note(s,'Proposed engagement brief based on user description and src/pages/HomePage.tsx service model. No signed scope, schedule, price or service level exists in the supplied facts. All such decisions remain to be agreed.');
const candidate=root+`/.presentation-build/editorial-${version}-candidate.pptx`,finalPath=root+`/outputs/presentations/Prime-State-Systems-Editorial-${version}.pptx`;
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath,pythonExecutable:'C:/Users/vee/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit','--require-native-table-slide','6','--require-native-table-slide','7'],explicitTotalSlideCount:8,requiredNativeTableOwnerSlides:[6,7],fontPolicy:{basis:'design',families:['Arial','Georgia']},verifyArtifactToolImport:true,receiptPath:root+`/.presentation-build/editorial-${version}-validation.json`});
for(let i=0;i<8;i++){let b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(root+`/.presentation-build/editorial-${version}-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
console.log(finalPath);



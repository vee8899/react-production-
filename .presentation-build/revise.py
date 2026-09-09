from pathlib import Path
p=Path('.presentation-build/reviewed.mjs')
s=p.read_text(encoding='utf-8')
a=s.index("const cols="); b=s.index("s.speakerNotes",a)
s=s[:a]+'''const cols=[['01  MANAGED SERVICE','The process around the platform','Map the business pipeline and agree rules, responsible people and exceptions.\\n\\nConfigure integrations, routing and approvals around existing systems.\\n\\nValidate the workflow and establish an operating review cadence.','DELIVERABLE: Agreed process and pilot'],['02  PLATFORM VIEW','Inspect what actually ran','Review organization-specific workflows and their execution history.\\n\\nInspect status, duration, retries and processed or failed records.\\n\\nOpen execution steps and investigation notes when a run needs attention.','REPO INTERFACE: Preproduction capability'],['03  ILLUSTRATIVE WORKFLOW','Document generation','Approved input → populate a versioned template → request approval → deliver the document → record the result.\\n\\nException: missing required data pauses the proposed process for review.\\n\\nThe operating view exposes run status, execution steps and failure details.','EXAMPLE: Configuration subject to scoping']];
cols.forEach(([lab,head,body,out],i)=>{let x=64+i*394;tx(s,'label'+i,lab,x,248,365,30,14,'#526859');tx(s,'heading'+i,head,x,288,365,50,25,'#0F0E0D','Georgia');tx(s,'body'+i,body,x,344,350,248,20,'#6B6762');rule(s,x,604,350);tx(s,'output'+i,out,x,618,354,43,16);});
''' +s[b:]
a=s.index('stages.forEach');b=s.index('s.speakerNotes',a)
s=s[:a]+'''stages.forEach(([head,body,out],i)=>{let [x,y]=coords[i];s.shapes.add({geometry:'rect',position:B(x,y,350,192),fill:'#F2F0ED',line:{fill:'#D0CBC4',width:1}});tx(s,'stage'+i,`0${i+1}  ${head}`,x+13,y+10,326,39,23,'#0F0E0D','Georgia');tx(s,'detail'+i,body,x+13,y+53,321,76,19,'#6B6762');tx(s,'result'+i,'OUTPUT  '+out,x+13,y+137,321,48,16,'#526859');});
for(const [x,y,g] of [[420,321,'rightArrow'],[814,321,'rightArrow'],[1016,443,'downArrow'],[814,531,'leftArrow'],[420,531,'leftArrow']])s.shapes.add({geometry:g,position:B(x,y,g==='downArrow'?21:31,g==='downArrow'?13:21),fill:'#526859',line:{fill:'none',width:0}});
''' +s[b:]
s=s.replace("['Test & approve','Run sample and failure cases; review results and approve the pilot.','Acceptance record and launch decision']","['Test & approve','Validate normal and failure cases; client approves launch.','Client launch approval gate']")
s=s.replace("['Evaluation','Compare handling time, completion, exceptions and manual intervention.','Joint review']","['Evaluation','Review baseline versus pilot results; success thresholds agreed in advance.','Joint review']")
s=s.replace("NEXT STEP  Identify the first workflow and agree the pilot specification.","CLIENT INPUT  Nominate an owner; select a workflow; provide approved sample data and access.")
s=s.replace("Sources: supplied product description; repository README.md; src/pages/HomePage.tsx; src/pages/DashboardPage.tsx.","Sources: supplied product description; repository README.md; src/pages/HomePage.tsx; src/pages/DashboardPage.tsx; src/components/dashboard/RunDetail.tsx; src/pages/WorkflowsPage.tsx. Document generation is illustrative, not a live deployment. Missing-data handling is proposed configuration.")
s=s.replace('dense-candidate','reviewed-candidate').replace('Prime-State-Systems-Detailed.pptx','Prime-State-Systems-Reviewed.pptx').replace('dense-validation','reviewed-validation').replace('dense-${i}','reviewed-${i}')
p.write_text(s,encoding='utf-8')


const n0=trigger({"type":"n8n-nodes-base.scheduleTrigger","version":1.3,"config":{"name":"Every 15 Minutes","parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}}}});
const n1=trigger({"type":"n8n-nodes-base.manualTrigger","version":1,"config":{"name":"Manual acceptance","parameters":{}}});
const n2=node({"type":"n8n-nodes-base.postgres","version":2.6,"config":{"name":"Find pending reports","parameters":{"operation":"executeQuery","query":"select * from automation.pending_report_ids()","options":{}},"credentials":{"postgres":{"id":"9NYei4dh7z08Xyf4","name":"Postgres account"}}}});
const n3=node({"type":"n8n-nodes-base.executeWorkflow","version":1.3,"config":{"name":"Recover report","parameters":{"mode":"once","source":"database","workflowId":{"__rl":true,"mode":"id","value":"9zbbX0mzILkkXG1e"},"options":{"waitForSubWorkflow":true}}}});
const batch=splitInBatches({version:3,config:{name:'Recover one report at a time',parameters:{batchSize:1}}});
export default workflow('iinJGEl68Xp2t5Re','Platform - Run Reporting Recovery').add(n0).to(n2).to(batch.onEachBatch(n3.to(nextBatch(batch)))).add(n1).to(n2);

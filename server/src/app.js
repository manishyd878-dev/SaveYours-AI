import express from 'express';import cors from 'cors';import path from 'path';import {fileURLToPath} from 'url';import fs from 'fs';
import {analyzeConversation,redact} from './safety/engine.js';import {runSuite} from './safety/evaluate.js';import {runAnalysis,MODES,evaluateAI} from './services/analysis.js';import {aiConfigured,AI_MODEL} from './services/ai.js';import {scenarios} from './data/scenarios.js';
const MAX_MSGS=60,MAX_LEN=1000;
export function validate(msgs){
  if(!Array.isArray(msgs)||!msgs.length||msgs.length>MAX_MSGS)return`messages must be an array of 1-${MAX_MSGS} items`;
  for(const m of msgs)if(!m||!['child','other'].includes(m.from)||typeof m.text!=='string'||!m.text.trim()||m.text.length>MAX_LEN)return`each message needs from (child|other) and text up to ${MAX_LEN} chars`;
  return null;
}
export function createApp(){
  const app=express();app.use(cors());app.use(express.json({limit:'100kb'}));
  app.get('/api/health',(_q,r)=>r.json({ok:true,mode:aiConfigured()?'ai-enabled':'demo',aiConfigured:aiConfigured(),model:aiConfigured()?AI_MODEL:null,ai:aiConfigured()?'Gemini analysis available (conversation text is redacted, then sent to Google).':'No API key configured: rule-based analysis only.'}));
  app.get('/api/scenarios',(_q,r)=>r.json(scenarios));
  app.post('/api/analyze',async(q,r)=>{const e=validate(q.body.messages);if(e)return r.status(400).json({error:e});const mode=q.body.mode??'rules';if(!MODES.includes(mode))return r.status(400).json({error:'mode must be rules, ai or compare'});r.json(await runAnalysis(q.body.messages,mode));});
  app.post('/api/evaluate',async(q,r)=>{const out=runSuite(scenarios);if(q.body?.includeAI!==true)return r.json(out);if(!aiConfigured())return r.json({...out,aiEval:{ok:false,reason:'no_api_key'}});r.json({...out,aiEval:await evaluateAI(scenarios)});});
  app.post('/api/privacy/redact',(q,r)=>{if(typeof q.body.text!=='string'||q.body.text.length>5000)return r.status(400).json({error:'text required (max 5000 chars)'});r.json(redact(q.body.text));});
  const dist=path.join(path.dirname(fileURLToPath(import.meta.url)),'../../client/dist');
  if(fs.existsSync(dist)){app.use(express.static(dist));app.get(/^\/(?!api).*/,(_q,r)=>r.sendFile(path.join(dist,'index.html')));}
  return app;
}

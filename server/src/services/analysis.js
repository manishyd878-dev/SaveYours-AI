import {analyzeConversation} from '../safety/engine.js';
import {analyzeWithAI,aiConfigured} from './ai.js';
import {metrics} from '../safety/evaluate.js';
export const MODES=['rules','ai','compare'];
const MAP={personal_info:'sensitive_info',dangerous:'coercion'};
const toCat=k=>MAP[k]||k;
export function compare(rules,ai){
  const r=new Set(rules.signals.map(s=>toCat(s.signal))),a=new Set(ai.signals.map(s=>s.category));
  const both=[...r].filter(x=>a.has(x));
  return{agreeSignals:both,onlyRules:[...r].filter(x=>!a.has(x)),onlyAI:[...a].filter(x=>!r.has(x)),
    rulesLevel:rules.risk,aiLevel:ai.concernLevel,levelAgrees:rules.risk===ai.concernLevel,
    note:'Agreement does not imply correctness. Neither system has been validated on real data; see the Safety Lab for the synthetic comparison.'};
}
// Rules always run and stay the baseline; top-level fields stay backward compatible.
export async function runAnalysis(messages,mode='rules',opts={}){
  const rules=analyzeConversation(messages);
  const base={...rules,mode,rules,source:'rules',aiAvailable:opts.client!==undefined?!!opts.client:aiConfigured()};
  if(mode==='rules')return base;
  const out=await analyzeWithAI(messages,opts);
  if(!out.ok)return{...base,source:'rules',fallback:{reason:out.reason,message:'AI analysis was unavailable ('+out.reason+'). Showing rule-based results only; no AI response was used.'}};
  const ai=out.result;
  return{...base,source:mode==='compare'?'rules+ai':'ai',ai,redactionsBeforeAI:out.redactions,comparison:mode==='compare'?compare(rules,ai):undefined};
}
export async function evaluateAI(scenarios,opts={}){
  const results=[];
  for(const s of scenarios){
    const o=await analyzeWithAI(s.messages,opts);
    if(!o.ok)return{ok:false,reason:o.reason,completed:results.length};
    results.push({id:s.id,title:s.title,expected:s.expected,rationale:s.rationale,predicted:o.result.concernLevel});
  }
  return{ok:true,results,metrics:metrics(results)};
}

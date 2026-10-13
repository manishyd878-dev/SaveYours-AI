// Deterministic, transparent rules. Signals are only counted from non-child speakers.
export const SIGNALS = {
  personal_info:{label:'Sensitive information request',weight:2,re:/(what('?s| is) your (home )?address|where do you live|which school|your (full )?name|phone number|password|send (me )?(a )?(photo|pic)|are your parents (home|out)|home alone)/i},
  secrecy:{label:'Secrecy pressure',weight:3,re:/(our (little )?secret|don'?t tell (anyone|your|mom|dad)|keep (this|it) (between us|secret)|delete (this|these) (chat|messages))/i},
  isolation:{label:'Isolation / dependency',weight:3,re:/(only i understand|nobody (else )?(understands|cares)|you don'?t need (your )?(friends|family|parents)|they don'?t (really )?(care|get you)|just talk to me)/i},
  bullying:{label:'Harassment / bullying',weight:3,re:/(you'?re (so )?(stupid|ugly|worthless|a loser|pathetic)|nobody likes you|everyone hates you|loser)/i},
  dangerous:{label:'Dangerous / coercive advice',weight:6,re:/(kill yourself|hurt yourself|skip (eating|meals)|sneak out|meet me (alone|tonight))/i},
  discourage:{label:'Discouraging trusted help',weight:3,re:/(don'?t (talk to|tell|ask) (a |your )?(teacher|counselor|parents?|adult|doctor)|adults? (won'?t|will never) (understand|help)|no need (for|to see) (a )?(counselor|therapist|doctor))/i}
};
const CONTEXT_RE=/(lonely|sad|stressed|anxious|bad day|upset)/i;
export const LABELS={low:'Low Concern',attention:'Needs Attention',high:'High Concern'};
export function classify(score){return score>=6?'high':score>=2?'attention':'low';}
export function analyzeMessage(m){
  const hits=[];
  if(m.from!=='child')for(const[k,s]of Object.entries(SIGNALS)){const x=m.text.match(s.re);if(x)hits.push({signal:k,label:s.label,evidence:x[0]});}
  const context=m.from==='child'&&CONTEXT_RE.test(m.text);
  return{hits,context};
}
export function analyzeConversation(messages){
  const seen=new Map();let score=0;const timeline=[];
  messages.forEach((m,i)=>{
    const a=analyzeMessage(m);const before=score;const newSignals=[];
    for(const h of a.hits){
      if(!seen.has(h.signal)){seen.set(h.signal,[]);score+=SIGNALS[h.signal].weight;newSignals.push(h.signal);if(seen.size===2)score+=2;}
      else score+=1;
      seen.get(h.signal).push({index:i,evidence:h.evidence});
    }
    timeline.push({index:i,from:m.from,text:m.text,hits:a.hits,context:a.context,score,risk:classify(score),
      note:newSignals.length?`New signal(s): ${newSignals.map(s=>SIGNALS[s].label).join(', ')}.`:a.hits.length?'Repeated signal raised score slightly.':a.context?'Child expressed emotion; treated as context, not a risk signal.':'No new evidence.',changed:score!==before});
  });
  const risk=classify(score);const signals=[...seen.entries()].map(([k,ev])=>({signal:k,label:SIGNALS[k].label,evidence:ev}));
  const combo=seen.size>=2;
  return{risk,label:LABELS[risk],score,signals,timeline,
    reasons:signals.length?[...signals.map(s=>`${s.label}: ${s.evidence.length} occurrence(s).`),combo?'Multiple distinct signals together are weighted higher than any isolated signal.':'Single isolated signal; interpretation is uncertain.']:['No rule-based signals found.'],
    uncertainty:'Keyword rules can miss paraphrases and misread jokes or quotes. This is a screening category, not a clinical assessment or proof of abuse.',
    recommendations:recommend(seen),
    privacy:'Analysis ran locally with deterministic rules. Nothing was stored.'};
}
function recommend(seen){
  const r=[];const has=k=>seen.has(k);
  if(!seen.size)return['No action needed. Keep chatting openly with trusted people about anything that feels off.'];
  if(has('personal_info'))r.push('Avoid sharing your address, school, passwords or photos with someone online.');
  if(has('secrecy')||has('discourage'))r.push('If someone asks you to keep secrets or avoid help, talk to a trusted adult. You are not in trouble.');
  if(has('isolation'))r.push('Healthy friends and helpers encourage your other relationships. Reach out to someone you trust.');
  if(has('bullying'))r.push('Unkind messages are not your fault. Save them, block the sender and use the platform reporting tool.');
  if(has('dangerous'))r.push('Pause the conversation. If you feel unsafe, contact a trusted adult or a local helpline right away.');
  return r;
}
export function redact(text){
  const rules=[[/[\w.+-]+@[\w-]+\.[\w.]+/g,'[EMAIL]'],[/\+?\d[\d\s().-]{7,}\d/g,'[PHONE]'],[/\b\d{1,5}\s+[A-Z][a-z]+\s+(Street|St|Road|Rd|Avenue|Ave|Lane|Ln)\b/g,'[ADDRESS]']];
  let out=text;const found=[];
  for(const[re,t]of rules)out=out.replace(re,()=>{found.push(t);return t;});
  return{text:out,found};
}

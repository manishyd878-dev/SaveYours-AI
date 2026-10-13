import {analyzeConversation} from './engine.js';
const L=['low','attention','high'];
export function metrics(rows){
  const matrix=L.map(()=>L.map(()=>0));let correct=0;let tp=0,fp=0,fn=0,tn=0;
  for(const r of rows){matrix[L.indexOf(r.expected)][L.indexOf(r.predicted)]++;if(r.expected===r.predicted)correct++;
    const e=r.expected!=='low',p=r.predicted!=='low';if(e&&p)tp++;else if(!e&&p)fp++;else if(e&&!p)fn++;else tn++;}
  return{total:rows.length,correct,falsePositives:fp,falseNegatives:fn,truePositives:tp,trueNegatives:tn,
    precision:tp+fp?tp/(tp+fp):null,recall:tp+fn?tp/(tp+fn):null,labels:L,matrix,
    note:'Binary metrics treat Needs Attention and High Concern as positive. Small synthetic set: demonstration only.'};
}
export function runSuite(scenarios){
  const results=scenarios.map(s=>({id:s.id,title:s.title,expected:s.expected,rationale:s.rationale,predicted:analyzeConversation(s.messages).risk}));
  return{results,metrics:metrics(results)};
}

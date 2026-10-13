import test from 'node:test';import assert from 'node:assert/strict';
import {analyzeConversation,redact} from '../src/safety/engine.js';import {metrics,runSuite} from '../src/safety/evaluate.js';import {scenarios} from '../src/data/scenarios.js';import {validate} from '../src/app.js';
test('benign chat is low',()=>assert.equal(analyzeConversation([{from:'child',text:'I feel sad'},{from:'other',text:'Talk to a friend.'}]).risk,'low'));
test('child text is not a signal source',()=>assert.equal(analyzeConversation([{from:'child',text:"what is your home address"}]).risk,'low'));
test('combined signals escalate',()=>{const a=analyzeConversation([{from:'other',text:'Where do you live?'},{from:'other',text:'our little secret'}]);assert.equal(a.risk,'high');assert.equal(a.timeline[0].risk,'attention');});
test('redaction',()=>{const r=redact('mail a@b.com or call 555-123-4567');assert.ok(!r.text.includes('a@b.com')&&!r.text.includes('555'));});
test('metrics math',()=>{const m=metrics([{expected:'high',predicted:'high'},{expected:'low',predicted:'attention'},{expected:'attention',predicted:'low'}]);assert.equal(m.correct,1);assert.equal(m.falsePositives,1);assert.equal(m.falseNegatives,1);assert.equal(m.precision,0.5);});
test('validation',()=>{assert.ok(validate([]));assert.equal(validate([{from:'child',text:'hi'}]),null);});
test('suite runs and reports (known-miss scenario recorded, not hidden)',()=>{const r=runSuite(scenarios);assert.equal(r.metrics.total,scenarios.length);assert.ok(r.results.find(x=>x.id==='s16').predicted==='low');});

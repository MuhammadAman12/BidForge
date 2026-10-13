import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import Module from 'node:module';
import path from 'node:path';
function load(name) {
  const filename = path.resolve(`lib/${name}.ts`);
  const mod = new Module(filename);
  const originalRequire = mod.require.bind(mod);
  mod.require = id => id === './analyzer' ? load('analyzer') : originalRequire(id);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText, filename);
  return mod.exports;
}
const { generateProposal } = load('proposal');
const { analyzeOpportunityWithKnowledgeBase } = load('analyzer');
const project = {project_name: 'Anomaly Lens', description: 'Customer analytics dashboard', technologies: ['React.js'], client_industry: null, project_url: null};
const opportunity = {title: 'Customer analytics dashboard', job_description: 'React dashboard with PostgreSQL and authentication.', analysis: {proposalStrategy: 'Highlight the listed evidence for React.'}};
test('draft uses project-backed React evidence without leaking strategy or inventing database experience', () => {
  const draft = generateProposal(opportunity, {full_name: 'Aman'}, [], [project]);
  assert.match(draft, /experience includes React/);
  assert.match(draft, /In Anomaly Lens, I worked with React/);
  assert.doesNotMatch(draft, /Highlight|Knowledge Base|practical exposure|experience includes.*PostgreSQL/);
  assert.match(draft, /confirm which parts I can take on/);
});
test('fresh profile evidence takes precedence over stale saved analysis', () => {
  const draft = generateProposal(opportunity, {full_name: 'Aman'}, [], []);
  assert.doesNotMatch(draft, /Anomaly Lens|My relevant experience/);
  assert.match(draft, /assess whether my experience is a good fit/);
});
test('aliases match consistently without confusing JavaScript and Java', () => {
  const result = analyzeOpportunityWithKnowledgeBase('React Node.js PostgreSQL Java', {profile:null,skills:[{skill_name:'ReactJS / NodeJS / Postgres / JavaScript',skill_level:null,years_experience:null}],projects:[],certifications:[],portfolioLinks:[]});
  assert.deepEqual(result.matchedSkills, ['React', 'Node.js', 'PostgreSQL']);
  assert.deepEqual(result.missingSkills, ['Java']);
});

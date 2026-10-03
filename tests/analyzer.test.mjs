import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import Module from 'node:module';
import path from 'node:path';
const filename = path.resolve('lib/analyzer.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const analyzerModule = new Module(filename);
analyzerModule._compile(compiled, filename);
const { analyzeOpportunity, analyzeOpportunityWithKnowledgeBase } = analyzerModule.exports;
const empty = { profile: null, skills: [], projects: [], certifications: [], portfolioLinks: [] };
test('JavaScript does not imply Java experience', () => {
  const result = analyzeOpportunity('Build a JavaScript web application');
  assert.ok(result.technologies.includes('JavaScript'));
  assert.ok(!result.technologies.includes('Java'));
});
test('generic development wording does not establish full-stack proficiency', () => {
  const result = analyzeOpportunityWithKnowledgeBase('Need full-stack development with PostgreSQL', { ...empty, skills: [{skill_name:'frontend development', skill_level:null, years_experience:null}] });
  assert.ok(!result.matchedSkills.includes('full-stack development'));
  assert.ok(result.missingSkills.includes('PostgreSQL'));
});
test('skill and project evidence personalize analysis without filling missing skills', () => {
  const result = analyzeOpportunityWithKnowledgeBase('React dashboard with PostgreSQL. Budget: $1,500. Timeline 3 weeks.', { ...empty, skills: [{skill_name:'React',skill_level:'Intermediate',years_experience:1}], projects:[{project_name:'Sales dashboard', description:'React analytics dashboard', technologies:['React'],client_industry:null,project_url:null}] });
  assert.deepEqual(result.matchedSkills, ['React']);
  assert.ok(result.missingSkills.includes('PostgreSQL'));
  assert.deepEqual(result.relevantProjects, ['Sales dashboard']);
  assert.equal(result.budget, '$1,500');
  assert.equal(result.timeline, '3 weeks');
  assert.match(result.proposalStrategy, /Clarify your capability for PostgreSQL/);
});
test('recognizes hourly and range budgets', () => {
  assert.equal(analyzeOpportunity('Budget $30/hour').budget, '$30/hour');
  assert.equal(analyzeOpportunity('Budget $1,000–$2,000').budget, '$1,000–$2,000');
});
test('empty Knowledge Base does not invent evidence', () => {
  const result = analyzeOpportunityWithKnowledgeBase('React development', empty);
  assert.deepEqual(result.matchedSkills, []);
  assert.deepEqual(result.evidence, []);
  assert.match(result.proposalStrategy, /without claiming/);
});

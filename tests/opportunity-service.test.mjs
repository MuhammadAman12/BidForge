import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import Module from 'node:module';
import path from 'node:path';

function service({ user = { id: 'user-1' }, results = {} } = {}) {
  const calls = [];
  const client = {
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from(table) {
      const call = { table, filters: [] };
      calls.push(call);
      const result = results[table] ?? { data: [], error: null };
      const query = {
        select() { return query; },
        eq(key, value) { call.filters.push([key, value]); return query; },
        insert(value) { call.insert = value; return query; },
        maybeSingle: async () => result,
        single: async () => result,
        then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
      };
      return query;
    },
  };
  const filename = path.resolve('services/opportunity-analysis.ts');
  const loaded = new Module(filename);
  loaded.require = id => {
    if (id === '@/lib/supabase') return { supabase: client };
    if (id === '@/lib/analyzer') return {};
    throw new Error(`Unexpected dependency: ${id}`);
  };
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return { ...loaded.exports, calls };
}

test('signed-out accounts cannot load another profile', async () => {
  const api = service({ user: null });
  await assert.rejects(api.loadAnalysisContext(), api.SignInRequired);
  assert.equal(api.calls.length, 0);
});

test('Knowledge Base reads are scoped to the authenticated profile', async () => {
  const api = service({ results: { profiles: { data: { id: 'profile-1' }, error: null } } });
  const context = await api.loadAnalysisContext();
  assert.equal(context.profileId, 'profile-1');
  assert.deepEqual(api.calls[0].filters, [['user_id', 'user-1']]);
  for (const call of api.calls.slice(1)) assert.deepEqual(call.filters, [['profile_id', 'profile-1']]);
  assert.deepEqual(context.knowledgeBase.skills, []);
  assert.equal(context.knowledgeBase.profile.full_name, '');
});

test('a failed Knowledge Base query is not disguised as an empty profile', async () => {
  const api = service({ results: {
    profiles: { data: { id: 'profile-1' }, error: null },
    skills: { data: null, error: new Error('Skills unavailable') },
  } });
  await assert.rejects(api.loadAnalysisContext(), /Skills unavailable/);
});

const input = { title: ' Dashboard ', description: ' React brief ', source: ' ' };
const analysis = { budget: '$1500', timeline: '3 weeks', projectType: 'Web Dashboard', matchedSkills: ['React'] };
const context = { profileId: 'profile-1' };

test('saving retains analysis and owner while normalizing input', async () => {
  const api = service({ results: { opportunities: { data: { id: 42 }, error: null } } });
  assert.equal(await api.saveAnalyzedOpportunity(input, analysis, context), 42);
  assert.deepEqual(api.calls[0].insert, {
    profile_id: 'profile-1', title: 'Dashboard', job_description: 'React brief',
    source: null, budget: '$1500', timeline: '3 weeks', project_type: 'Web Dashboard',
    analysis, status: 'analyzed',
  });
});

test('invalid input never reaches the database', async () => {
  const api = service();
  await assert.rejects(api.saveAnalyzedOpportunity({ ...input, title: ' ' }, analysis, context), /title and description/);
  await assert.rejects(api.saveAnalyzedOpportunity({ ...input, description: 'x'.repeat(30001) }, analysis, context), /input length/);
  assert.equal(api.calls.length, 0);
});

test('save failures and missing IDs do not report success', async () => {
  const failing = service({ results: { opportunities: { data: null, error: new Error('Save denied') } } });
  await assert.rejects(failing.saveAnalyzedOpportunity(input, analysis, context), /Save denied/);
  const missing = service({ results: { opportunities: { data: null, error: null } } });
  await assert.rejects(missing.saveAnalyzedOpportunity(input, analysis, context), /Check your opportunities before retrying/);
});

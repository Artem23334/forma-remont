import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEstimate } from '../lib/validation.mjs';

const valid = {
  name: 'Anna Kowalska',
  phone: '+48 600 100 200',
  email: 'anna@example.com',
  workType: 'lazienka',
  area: '5,5',
  startDate: '1-3-miesiace',
  description: 'Remont łazienki w bloku, wymiana płytek i instalacji.',
  consent: true,
};

test('accepts a complete valid request and normalizes values', () => {
  const r = validateEstimate(valid);
  assert.equal(r.ok, true);
  assert.equal(r.data.area, '5.5');
  assert.deepEqual(r.errors, {});
});

test('optional fields may be empty', () => {
  const r = validateEstimate({ ...valid, email: '', area: '', startDate: '' });
  assert.equal(r.ok, true);
});

test('rejects missing required fields', () => {
  const r = validateEstimate({});
  assert.equal(r.ok, false);
  for (const k of ['name', 'phone', 'workType', 'description', 'consent']) assert.ok(r.errors[k], `missing error for ${k}`);
  assert.equal(r.errors.email, undefined);
});

test('rejects bad phone, email, area, work type and start date', () => {
  const r = validateEstimate({ ...valid, phone: '12ab', email: 'nope@', area: '-3', workType: 'hack', startDate: 'jutro' });
  assert.ok(r.errors.phone);
  assert.ok(r.errors.email);
  assert.ok(r.errors.area);
  assert.ok(r.errors.workType);
  assert.ok(r.errors.startDate);
});

test('rejects too short description and missing consent', () => {
  const r = validateEstimate({ ...valid, description: 'krótko', consent: false });
  assert.ok(r.errors.description);
  assert.ok(r.errors.consent);
});

test('rejects overly long input', () => {
  const r = validateEstimate({ ...valid, name: 'x'.repeat(200), description: 'y'.repeat(5000) });
  assert.ok(r.errors.name);
  assert.ok(r.errors.description);
});

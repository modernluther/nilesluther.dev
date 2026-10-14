import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findViolations } from './copy-check.mjs';
test('flags em dashes', () => assert.equal(findViolations('a — b')[0].rule, 'em dash'));
test('flags banned words on word boundaries only', () => {
  assert.equal(findViolations('a heat map of players').length, 1);
  assert.equal(findViolations('a roadmap').length, 0);
  assert.equal(findViolations('software').length, 0);
});
test('flags the not-X-it-is-Y template', () => {
  assert.equal(findViolations("It's not a dashboard, it's a system.").length, 1);
  assert.equal(findViolations('Not fast. Not cheap. Reliable.').length, 1);
});
test('passes clean copy', () => assert.deepEqual(findViolations('Player rankings built on an event log.'), []));

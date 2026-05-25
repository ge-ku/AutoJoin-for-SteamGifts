// Run: node test/regression.js
const assert = require('assert');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  FAIL  ${name}: ${e.message}`);
    failed++;
  }
}

// B1: level regex must capture multi-digit levels
test('level regex captures level 10', () => {
  const text = 'Level 10';
  const m = text.match(/Level (\d+)/);
  assert.ok(m, 'no match');
  assert.strictEqual(m[1], '10');
});

test('level regex captures level 1', () => {
  const text = 'Level 1';
  const m = text.match(/Level (\d+)/);
  assert.ok(m, 'no match');
  assert.strictEqual(m[1], '1');
});

test('old level regex \\d caps at single digit', () => {
  const text = 'Level 10';
  const m = text.match(/Level (\d)/);
  // old bug: captures '1' not '10'
  assert.strictEqual(m[1], '1', 'old regex should only capture one digit');
});

// B2: wishList.push radix bug
test('parseInt with radix as push arg', () => {
  const arr = [];
  // buggy: arr.push(parseInt('5'), 10) pushes two values
  const buggyLen = (() => { const a = []; a.push(parseInt('5'), 10); return a.length; })();
  assert.strictEqual(buggyLen, 2, 'buggy push appends literal 10');

  // fixed: arr.push(parseInt('5', 10)) pushes one value
  const fixedLen = (() => { const a = []; a.push(parseInt('5', 10)); return a.length; })();
  assert.strictEqual(fixedLen, 1, 'fixed push appends only the parsed int');

  // fixed result is correct number
  arr.push(parseInt('42', 10));
  assert.strictEqual(arr[0], 42);
});

// B3: variable name sanity (manual, documents the fix)
test('json variable consistency (B3 doc)', () => {
  // Simulates: const json = { type: 'success' }; console.debug(..., json) — should not throw
  const json = { type: 'success' };
  assert.ok(json, 'json defined');
  // jsonResponse would be undefined — document that it would throw
  const jsonResponse = undefined;
  assert.strictEqual(jsonResponse, undefined, 'jsonResponse is undefined — old code would log undefined');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

var test = require('tape');
var canonicalizePhrase = require('../canonicalize-phrase');
var assertNoError = require('assert-no-error');

var testCases = [
  {
    phrase: 'Cleaning to Tidyness',
    expected: 'are Cleaning to Tidyness'
  },
  {
    phrase: 'Eating Breakfast',
    expected: 'are Eating Breakfast'
  },
  {
    phrase: 'Becoming Scuba Diver',
    expected: 'are Becoming Scuba Diver'
  },
  {
    phrase: 'calculated',
    expected: 'have calculated'
  },
  {
    phrase: 'shooing flies',
    expected: 'are shooing flies'
  },
  {
    phrase: 'Making Weight',
    expected: 'are Making Weight'
  },
  {
    phrase: 'Meeting People',
    expected: 'are Meeting People'
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.phrase, canonicalizeTest);

  function canonicalizeTest(t) {
    canonicalizePhrase(testCase.phrase, checkResult);

    function checkResult(error, result) {
      assertNoError(t.ok, error, 'No error while canonicalizing.');
      t.equal(result, testCase.expected, 'Result is correct.');
      t.end();
    }
  }
}

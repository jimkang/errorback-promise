var test = require('tape');
var ep = require('../index');
var assertNoError = require('assert-no-error');
var callNextTick = require('call-next-tick');

var testCases = [
  {
    name: 'Two params, two values success',
    params: ['hey', 100],
    callbackCaller: callbackCaller_2_2,
    expectError: false,
    expectedValues: ['HEY', 'hey!!!!!!!!!!!!!!!!!!!!!!']
  },
  {
    name: 'Two params, two values failure',
    params: [null, 100],
    callbackCaller: callbackCaller_2_2,
    expectError: true,
    expectedValues: null
  },
  {
    name: 'Zero params, two values success',
    params: [],
    callbackCaller: callbackCaller_0_2_succeed,
    expectError: false,
    expectedValues: ['yo', { text: 'yo' }]
  },
  {
    name: 'Zero params, two values failure',
    params: [],
    callbackCaller: callbackCaller_0_2_fail,
    expectError: true,
    expectedValues: null
  },
  {
    name: 'One param, zero values success',
    params: [4],
    callbackCaller: callbackCaller_1_0,
    expectError: false,
    expectedValues: []
  },
  {
    name: 'One param, zero values failure',
    params: ['a'],
    callbackCaller: callbackCaller_1_0,
    expectError: true,
    expectedValues: null
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.name, testEP);

  async function testEP(t) {
    var { error, values } = await ep.apply(
      ep,
      [testCase.callbackCaller].concat(testCase.params)
    );
    if (testCase.expectError) {
      t.ok(error, 'There is an error (as expected).');
    } else {
      assertNoError(t.ok, error, 'There should not be an error.');
      t.deepEqual(values, testCase.expectedValues, 'Values are correct');
      console.log(values);
    }
    t.end();
  }
}

function callbackCaller_2_2(text, delay, done) {
  if (!text) {
    callNextTick(done, new Error('No text to transform.'));
    return;
  }

  setTimeout(transformText, delay);

  function transformText() {
    done(null, text.toUpperCase(), text.padEnd(25, '!'));
  }
}

function callbackCaller_0_2_succeed(done) {
  callNextTick(done, null, 'yo', { text: 'yo' });
}

function callbackCaller_0_2_fail(done) {
  callNextTick(done, new Error('Oh no'));
}

function callbackCaller_1_0(n, done) {
  if (isNaN(n)) {
    callNextTick(done, new Error('Not a number'));
    return;
  }

  callNextTick(done);
}

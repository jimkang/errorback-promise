// Return a promise that resolves with the error, even when it
// catches the error.
// Expecting params: callback calling function, arguments for that function.
async function errorbackPromise(callbackCaller) {
  var params = sliceArgumentsAfterFirstOneIntoParamArray(arguments);

  return new Promise(executor);

  function executor(resolve) {
    params.push(callback);
    callbackCaller.apply(callbackCaller, params);
    function callback(error) {
      resolve({
        error,
        values: sliceArgumentsAfterFirstOneIntoParamArray(arguments)
      });
    }
  }
}

// This does not use Array.prototype.slice.call on `arguments` because V8 does not
// know how to optimize one function's `arguments` being used outside that function.
// TODO: Find out if this is still an issue.
function sliceArgumentsAfterFirstOneIntoParamArray(args) {
  var argsLength = args.length;
  var params = [];

  if (argsLength > 1) {
    params = new Array(argsLength - 1);
    for (var i = 1; i < argsLength; ++i) {
      params[i - 1] = args[i];
    }
  }

  return params;
}

module.exports = errorbackPromise;

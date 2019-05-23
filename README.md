errorback-promise
=====================

Wraps a promise around a function that uses a callback so you can use it with async/await. However, the promise does not reject. Instead, the callback's error is captured and returned in an object, in the spirit of [https://github.com/scopsy/await-to-js](to).

This lets you use async/await while also allowing you to handle errors after every call without having use async/await.

Hopefully, this:

- Discourages (generally) bad practices like ignoring the error or handling the error only in a single catch for several async operations
- Encourages handling errors as they come and always thinking about errors when performing async operations

tl;dr: Instead of:

    // .*PromiseMaker functions in the example are assumed to
    // be callbacks wrapped in promise makers like promisify.
    try {
      var values = await getPancakesPromiseMaker(param1, param2);
    } catch (error) {
      // There's no way we can recover from this; bail.
      console.log(error, error.stack);
      return;
    }
    breakfast.push(values[0]);

    try {
      await addSyrupPromiseMaker(values[0]);
    } catch (error) {
      // We can recover from this.
      userNote = 'We were not able to order you maple syrup, but we have your pancake.';
    }
    try {
      var values3 = await getCoffeePromiseMaker();
    } catch (error) {
      // We can recover from this.
      userNote += 'Sorry, we could not get coffee.';
    }

    breakfast.push(values3[0]);
    return { breakfast, userNote };

Or, worse, this:

    let userNote = '';
    let breakfast = [];
    try {
      let values = await getPancakesPromiseMaker(param1, param2);
      await addSyrupPromiseMaker(values[0]);
      let values3 = await getCoffeePromiseMaker();
    } catch (error) {
      // Handle all of the errors the same.
      return { userNote: 'Sorry, something went wrong.' };  
    }
    return { breakfast: [values[0], values3[0] };

Or, even worse, this:

    let userNote = '';
    let breakfast = [];
    let values = await getPancakesPromiseMaker(param1, param2);
    await addSyrupPromiseMaker(values[0]);
    let values3 = await getCoffeePromiseMaker();
    return { breakfast: [values[0], values3[0] };

You can do this:

    let userNote = '';
    let breakfast = [];
    let r = await ep(getPancakesCallbackCaller, param1, param2);
    if (r.error) {
      // There's no way we can recover from this; bail.
      console.log(error, error.stack);
      return;
    }
    breakfast.push(r.values[0]);

    let r2 = await ep(addSyrupCallbackCaller, r.values[0]);
    if (r2.error) {
      // We can recover from this.
      userNote = 'We were not able to order you maple syrup, but we have your pancake.';
    }

    let r3 = await ep(getCoffeeCallbackCaller);
    if (r3.error) {
      // We can recover from this.
      userNote += 'Sorry, we could not get coffee.';
    } else {
      breakfast.push(r3.values[0]);
    }
    return { breakfast, userNote };

I know it's not as short as the example with no error handling, but it is still readable while avoiding the creation of future nightmares by handling the errors as they come.

Installation
------------

    npm install errorback-promise

Usage
-----

    var ep = require('errorback-promise');
    var callNextTick = require('call-next-tick');

    function callbackCaller(text, delay, done) {
      if (!text) {
        callNextTick(done, new Error('No text to transform.'));
        return;
      }

      setTimeout(transformText, delay);

      function transformText() {
        done(null, text.toUpperCase(), text.padEnd(25, '!'));
      }
    }

    var { error, values } = await ep(callbackCaller, 'hey', 1000);
    if (error) {
      console.error(error, error.stack);
      return;
    }
    console.log("Here's the goods:", values[0]);
    // Now do other stuff.

This example will log 'HEY' after a second. If `undefined` were passed as the second param to `ep`, the error handling clause after the call would kick in.

The promise fulfillment delivers an object with two properties:

- error: The error object that is passed to the callback.
- values: The non-error values passed to the callback.

Tests
-----

Run with `make test`.

License
-------

Copyright (c) 2019 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
HE SOFTWARE.

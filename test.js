const test = require('ava')
const cp = require('child_process');
test.before( () => {
    console.log("run test server")

    const child = cp.spawn("node", ["--harmony-async-await",  __dirname + "/examples/index.js"], {detached: false})

    child.stdout.on('data', console.log)
    child.on('error', console.log);
    child.stderr.on('data', console.log);
    child.on('close', function(code) {
        console.log("Service stopped");
    });
    child.on('message', console.log);
      

})

test('foo', t => {
	t.pass();
});

test('bar', async t => {
	const bar = Promise.resolve('bar');

	t.is(await bar, 'bar');
});

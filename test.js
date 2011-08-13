/**
 * Testing simultanious spawning of multiple haibu-carapaces to prove issue #6 on https://github.com/nodejitsu/haibu-carapace
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var path = require('path'),
	spawn = require('child_process').spawn,
	inspect = require('util').inspect,
	Hook = require('hook.io').Hook;

//Start the test with the number of servers to create
doTest(5);

/**
 * Start the hook.io server and then 'number' of testservers
 * @param number {Integer} Number of testservers to start
 */
function doTest(number) {
	initHook(); 
	
	for (var i = 1; i <= number; i++) {
		var server = 'Server-' + i;
		
		console.log('spawning server: ' + server);
		spawnServer(server);
	}
}

/**
 * Initialize hook.io server for catching carapace events
 * @return {Hook} The created hook.io server
 */
function initHook() {
	// get new hook.io server
	var hookServer = new Hook();
	
	// start listening for hook.io clients
	hookServer.listen(function (err) {
		// TODO if Hook server cant be startup then do something...
		return;
	});
	
	// start listening for hook.io events
	hookServer.onAny(function (data) {
		console.log(this.event.toString() + '    ' + inspect(data))
	});
	
	return hookServer;
}

/**
 * Spawn a haibu-carapace child which starts a http testserver on port 8000
 * @param id {String} Id to be used for logging
 * @return {Process.child} 
 */
function spawnServer(id) {
	var child,
		script = path.join(__dirname, 'server.js');
		command = path.join(__dirname, 'node_modules', '.bin', 'carapace');
	
	var carapaceOptions = [
		script,
		'--hook-name',
		id,
	];
	
	// Spawn carapace with options
	child = spawn(command, carapaceOptions);

	child.stdout.on('data', function (data) {
		console.log('stdout: ' + id, data.toString());
	});

	child.stderr.on('data', function (data) {
		console.log('stderr: ' + id, data.toString());
	}); 

	child.on('exit', function (code) {
		console.log('child process exited with code ' + code);
	});

	return child;
}

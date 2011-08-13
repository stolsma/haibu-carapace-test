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
doTest(20, 6000, false);

/**
 * Start the requested number of hook.io servers and testservers
 * @param number {Integer} Number of testservers to start
 * @param basePort {Integer} The base port to use to startup hook.io servers from
 * @param debug {Boolean} True if debug msg need to be put on console...
 */
function doTest(number, basePort, debug) {
	var errStat = {
		number: 0,
		list: []
	};
	
	function error(id) {
		errStat.number++;
		errStat.list.push(id);
	};
	
	console.log('Starting ' + number + ' test servers...  Wait for the Test End msg!!');
	
	for (var i = 1; i <= number; i++) {
		var server = 'Server-' + i,
			port = basePort++;
		
		if (debug) console.log('spawning server: ' + server + '  at port: ' + port);
		
		// start a hook.io server for each server to prevent the ECONNRESET error: thats a bug in hook.io!!! 
		initHook(server, port, debug); 
		spawnServer(server, port, error, debug);
	}
	console.log('All ' + number + ' servers are spawned... Wait for the Test End msg (approx. 30 sec from now) to show up!!');
	
	var t = setTimeout(function() {
		if (errStat.number==0) 
			console.log('All tests are done. If there are no Error Messages then everything went ok!!');
		else
			console.log('All tests are done. ' + errStat.number + ' servers died!!! ', errStat.list);
	},30000);
}

/**
 * Initialize hook.io server for catching carapace events
 * @param id {String} Name to be used for the hook.io server
 * @param port {Integer} The port to use for the hook.io server
 * @param debug {Boolean} True if debug msg need to be put on console...
 * @return {Hook} The created hook.io server
 */
function initHook(id, port, debug) {
	// get new hook.io server
	var hookServer = new Hook({
		name: id,
		'hook-port': port
	});
	
	hookServer.debug = debug || false;;
	
	// start listening for hook.io clients
	hookServer.listen(function (err) {
		// TODO if Hook server cant be startup then do something...
		return;
	});
	
	return hookServer;
}

/**
 * Spawn a haibu-carapace child which starts a http testserver on port 8000
 * @param id {String} Id to be used for logging
 * @param port {Integer} The port to use for the hook.io server
 * @param error {Function} Function to call when a child dies.
 * @param debug {Boolean} True if debug msg need to be put on console...
 * @return {Process.child} 
 */
function spawnServer(id, port, error, debug) {
	var child,
		script = path.join(__dirname, 'server.js');
		command = path.join(__dirname, 'node_modules', '.bin', 'carapace');
	
	var carapaceOptions = [
		script,
		'--hook-name',
		id,
		'--hook-port',
		port,
	];
	
	// Spawn carapace with options
	child = spawn(command, carapaceOptions);

	child.stdout.on('data', function (data) {
		if (debug) console.log('stdout: ' + id, data.toString());
	});

	child.stderr.on('data', function (data) {
		console.log('stderr: ' + id, data.toString());
	}); 

	child.on('exit', function (code) {
		console.log('child process: ' + id + ' exited with code ' + code);
		error(id);
	});

	return child;
}

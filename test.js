/**
 * Testing simultanious spawning of multiple haibu-carapaces to prove issue #6 on https://github.com/nodejitsu/haibu-carapace
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var path = require('path'),
	spawn = require('child_process').spawn,
	inspect = require('util').inspect,
	Hook = require('hook.io').Hook,
	argv = require('optimist').argv;

var debug = (argv.debug) ? true : false,
	procs = (argv.procs) ? argv.procs : 1,
	basePort = (argv.base) ? argv.base : 6000;

//Start the test with the given arguments
doTest(procs, basePort, debug);

/**
 * Start the requested number of hook.io servers and testservers
 * @param number {Integer} Number of testservers to start
 * @param basePort {Integer} The base port to use to startup hook.io servers from
 * @param debug {Boolean} True if debug msg need to be put on console...
 */
function doTest(number, basePort, debug) {
	var procs = 0, 
		errStat = {
		  number: 0,
		  list: []
		};
	
	function error(id) {
		errStat.number++;
		errStat.list.push(id);
	};
	
	function ready() {
		if (--procs == 0) {
			if (errStat.number==0) { 
				console.log('All tests are done. If there are no aditional Error Messages then everything went ok!!');
				process.exit(0);
			} else {
				console.log('All tests are done. ' + errStat.number + ' servers died!!! ', errStat.list);
				process.exit(1);
			}
		}
	};
	
	console.log('Starting ' + number + ' test servers...  Wait for the Test End msg!!');
	
	for (var i = 1; i <= number; i++) {
		var server = 'Server-' + i,
			port = basePort++;
		
		if (debug) console.log('spawning server: ' + server + ' using hook.io port: ' + port);
		
		// start a hook.io server for each server to prevent the ECONNRESET error: thats a bug in hook.io!!! 
		initHook(server, port, debug); 
		spawnServer(server, port, ready, error, debug);
		procs++;
	}
	console.log('All ' + number + ' servers are spawned... Wait for the Test End msg to show up!!');
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
 * @param ready {Function} Function to call when a child exited.
 * @param error {Function} Function to call when a child died.
 * @param debug {Boolean} True if debug msg need to be put on console...
 * @return {Process.child} 
 */
function spawnServer(id, port, ready, error, debug) {
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
		if (debug) console.log('child process: ' + id + ' exited with code ' + code);
		if (code !==0) error(id);
		ready();
	});

	return child;
}

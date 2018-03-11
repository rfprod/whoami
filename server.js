'use strict';

const express = require('express'),
	routes = require('./app/routes/index.js'),
	mongoose = require('mongoose'),
	app = express(),
	expressWs = require('express-ws')(app), // eslint-disable-line no-unused-vars
	cluster = require('cluster'),
	os = require('os');
let clusterStop = false;

require('dotenv').load();

const cwd = __dirname;

mongoose.connect(process.env.MONGODB_URI);

app.use('/public', express.static(cwd + '/public'));

const DataInit = require('./app/utils/data-init.js'),
	srvInfo = require('./app/utils/srv-info.js'),
	Log = require('./app/models/logs');

routes(app, cwd, srvInfo, DataInit, Log);

const port = process.env.PORT || 8080,
	ip = process.env.IP || '0.0.0.0';

function terminator(sig) {
	if (typeof sig === 'string') {
		console.log('%s: Received %s - terminating app ' + sig + '...', Date(Date.now()));
		if (cluster.isMaster && !clusterStop) {
			cluster.fork();
		} else {
			process.exit(0);
			if (!cluster.isMaster) console.log('%s: Node server stopped', Date(Date.now()));
		}
	}
}

(() => {
	/*
	*   termination handlers
	*/
	process.on('exit', () => { terminator('exit'); });
	// Removed 'SIGPIPE' from the list - bugz 852598.
	['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
		'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
	].forEach((element) => {
		process.on(element, () => {
			clusterStop = true;
			terminator(element);
		});
	});
})();

if (cluster.isMaster && process.env.CLUSTER === 'true') {
	const workersCount = os.cpus().length;
	console.log(`$> WhoAmI listening on ${ip}:${port} ...`);
	console.log(`Cluster setup, workers count: ${workersCount}`);
	for (let i = 0; i < workersCount; i++) {
		console.log(`Starting worker ${i}`);
		cluster.fork();
	}
	cluster.on('online', (worker, error) => {
		if (error) throw error;
		console.log(`Worker pid ${worker.process.pid} is online`);
	});
	cluster.on('exit', (worker, code, signal) => {
		console.log(`Worker pid ${worker.process.pid} exited with code ${code} and signal ${signal}`);
		if (!clusterStop) {
			console.log('Starting a new worker...');
			cluster.fork();
		}
	});
} else {
	app.listen(port, ip, () => {
		console.log(`$> WhoAmI listening on ${ip}:${port} ...`);
	});
}

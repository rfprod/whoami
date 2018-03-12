'use strict';

module.exports = function (app, cwd, srvInfo, DataInit, Log) {

	DataInit.initData();

	app.get('/', (req, res) => {
		res.sendFile(cwd + '/public/index.html');
	});

	app.get('/whoami', (req, res) => {
		const headers = req.headers;
		let userIP = undefined,
			userLang = undefined,
			userSoft = undefined;
		if (headers['x-forwarded-for']) userIP = headers['x-forwarded-for'];
		if (headers['accept-language']) userLang = headers['accept-language'].substr(0, headers['accept-language'].indexOf(','));
		if (headers['user-agent']) userSoft = headers['user-agent'];
		const output = `{"ipaddress":"${userIP}","language":"${userLang}","useragent":"${userSoft}"}`;

		if (userIP && userLang && userSoft &&
			typeof userIP !== 'undefined' &&
			typeof userLang !== 'undefined' &&
			typeof userSoft !== 'undefined'
		) {
			Log.find({'serverHeaders.xForwardedFor': userIP}, (err, doc) => {
				if (err) throw err;
				let docExists = (doc.length > 0) ? true : false,
					sameLang = false,
					sameUserAgent = false,
					ipFound = false;
				if (docExists) {
					let srvHeaders = doc[0].serverHeaders;
					srvHeaders.forEach((hItem) => {
						if (hItem.acceptLanguage.length > 0){
							hItem.acceptLanguage.forEach((item) => {
								if (item === userLang) sameLang = true;
							});
						}
						if (hItem.userAgent.length > 0) {
							hItem.userAgent.forEach((item) => {
								if (item === userSoft) sameUserAgent = true;
							});
						}
						if (hItem.xForwardedFor === userIP) {
							ipFound = true;
						}
						if (ipFound && !sameLang && !sameUserAgent) {
							Log.update(
								{'serverHeaders.xForwardedFor': userIP},
								{$push:{'serverHeaders.$.acceptLanguage': userLang, 'serverHeaders.$.userAgent': userSoft}},
								(err, data) => {
									if (err) throw err;
									console.log('updated log: ' + JSON.stringify(data));
								}
							);
						}
						if (ipFound && !sameLang && sameUserAgent) {
							Log.update(
								{'serverHeaders.xForwardedFor': userIP},
								{$push:{'serverHeaders.$.acceptLanguage': userLang}},
								(err, data) => {
									if (err) throw err;
									console.log('updated log: ' + JSON.stringify(data));
								}
							);
						}
						if (ipFound && sameLang && !sameUserAgent) {
							Log.update(
								{'serverHeaders.xForwardedFor': userIP},
								{$push:{'serverHeaders.$.userAgent': userSoft}},
								(err,data) => {
									if (err) throw err;
									console.log('updated log: ' + JSON.stringify(data));
								}
							);
						}
					});
				} else {
					let newLogEntry = new Log();
					newLogEntry.serverHeaders.push({
						xForwardedFor: userIP,
						acceptLanguage: userLang,
						userAgent: userSoft
					});
					newLogEntry.save((err) => {
						if (err) throw err;
						console.log('data saved: new log entry created');
					});
				}
			});
		}

		res.format({
			'application/json': function(){
				res.send(output);
			}
		});
	});
	
	app.get('/stats', (req, res) => {
		Log.find({}, (err, doc) => {
			if (err) throw err;
			doc.forEach((item1) => {
				item1.serverHeaders.forEach((item2) => {
					item2.xForwardedFor = item2.xForwardedFor.replace(/\.\d+\.\d+$/, '.***.***');
				});
			});
			res.setHeader('Cache-Control', 'no-cache, no-store');
			res.format({
				'application/json': function(){
					res.send(doc);
				}
			});
		});
	});

	app.get('/app-diag/static', (req, res) => {
		res.setHeader('Cache-Control', 'no-cache, no-store');
		res.format({
			'application/json': function(){
				res.send(srvInfo['static']());
			}
		});
	});

	app.get('/app-diag/dynamic', (req, res) => {
		res.setHeader('Cache-Control', 'no-cache, no-store');
		res.format({
			'application/json': function(){
				res.send(srvInfo['dynamic']());
			}
		});
	});

	app.ws('/app-diag/dynamic', (ws) => {
		console.log('websocket opened /app-diag/dynamic');
		let sender = null;
		ws.on('message', (msg) => {
			console.log('message:', msg);
			function sendData () {
				ws.send(JSON.stringify(srvInfo['dynamic']()), (err) => {if (err) throw err;});
			}
			if (JSON.parse(msg).action === 'get') {
				console.log('ws open, data sending started');
				sendData();
				sender = setInterval(() => {
					sendData();
				}, 5000);
			}
			if (JSON.parse(msg).action === 'pause') {
				console.log('ws open, data sending paused');
				clearInterval(sender);
			}
		});
		ws.on('close', () => {
			console.log('Persistent websocket: Client disconnected.');
			if (ws._socket) {
				ws._socket.setKeepAlive(true);
			}
			clearInterval(sender);
		});
		ws.on('error', () => {console.log('Persistent websocket: ERROR');});
	});
};

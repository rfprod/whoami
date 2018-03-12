const Log = require('../models/logs');

module.exports = {

	createDefaultLogs: function(callback) {
		Log.find({}, (err, docs) => {
			if (err) throw err;
			console.log(' >>> DOCS', docs);
			if (docs.length < 2) {
				Log.remove({}, (err, removed) => {
					if (err) throw err;
					console.log('cleared logs collection:', removed.result);
					let newLog1 = new Log();
					let newLog2 = new Log();
					const entries = [
						{
							xForwardedFor: '11.111.111.11',
							acceptLanguage: ['en-Us'],
							userAgent: ['Mozilla/5.0 (X11; Linux i686; rv:46.0) Gecko/20100101 Firefox/46.0']
						},
						{
							xForwardedFor: '22.222.222.22',
							acceptLanguage: ['en-Us', 'en-GB'],
							userAgent: [
								'Mozilla/5.0 (X11; Linux i686; rv:46.0) Gecko/20100101 Firefox/46.0',
								'Mozilla/5.0 (X11; Linux i686; rv:44.0) Gecko/20100101 Firefox/44.0'
							]
						}
					];
					newLog1.serverHeaders = [entries[0]];
					newLog1.save((err) => {
						if (err) throw err;
						console.log('default log entry created');
						newLog2.serverHeaders = [entries[1]];
						newLog2.save((err) => {
							if (err) throw err;
							console.log('default log entry created');
							callback(entries);
						});
					});
				});
			} else {
				console.log('default log entries exist');
				callback(docs);
			}
		});
	},

	initData: function(callback) {
		console.log('db data initialization');
		let response = {};
		this.createDefaultLogs((entries) => {
			response.defaultLogs = entries;
			console.log('data initialized:', response);
			if (callback) callback();
		});
	}

};


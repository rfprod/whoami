'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

let Log = new Schema({
	serverHeaders: [
		{
			xForwardedFor: String,
			acceptLanguage: [String],
			userAgent: [String]
		}
	]
});

module.exports = mongoose.model('Log', Log);

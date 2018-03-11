exports.config = {
	onPrepare: function() {
		browser.driver.get('http://localhost:8080/public/index.html');
	},

	specs: [
		'client/e2e/*.js'
	],

	capabilities: {
		browserName: 'chrome',
		chromeOptions: {
			args: [ '--headless', '--disable-gpu', '--window-size=1024x768' ]
		}
	},

	directConnect: true,

	chromeOnly: false,

	baseUrl: 'http://localhost:8080/',

	framework: 'jasmine',

	allScriptsTimeout: 15000,

	getPageTimeout: 15000,

	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 30000
	}

};

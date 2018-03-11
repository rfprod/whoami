const assert = require('chai').assert,
	expect = require('chai').expect;

const request = require('request');
const cheerio = require('cheerio'),
	str = require('string');

require('dotenv').load();
const baseUrl = 'http://localhost:' + process.env.PORT;

describe('/ endpoint', function() {
	it('should load a an angular initialization page', function(done) {
		request(baseUrl + '/', function(error,response,body) {
			
			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			
			done();
		});
	});
	it('should have title with specific text and div with class \'view-frame\' with no inner html', function(done) {
		request(baseUrl + '/', function(error,response,body) {
			
			const $ = cheerio.load(body);
			assert.equal(1, $('title').length);
			expect(str($('title').html()).contains('WhoAmI')).to.be.ok;
			assert.equal(1, $('div.view-frame').length);
			expect($('div.view-frame').html() === '').to.be.ok;
			
			done();
		});
	});
});

describe('/whoami endpoint', function() {
	it('should deliver request headings data as an object', function(done) {
		request(baseUrl + '/whoami', function(error,response,body) {
			
			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
	
			const responseObj = JSON.parse(response.body);
			
			assert.isObject(responseObj);
			assert.deepEqual(responseObj, {"ipaddress": "undefined", "language": "undefined", "useragent": "undefined"});
			
			/*
			*   actual response example:
			*   {"ipaddress":"212.7.192.148","language":"en-US","useragent":"Mozilla/5.0 (X11; Linux i686; rv:43.0) Gecko/20100101 Firefox/43.0"}
			*
			assert.isDefined(responseObj.ipaddress, 'ipaddress is defined');
			assert.isDefined(responseObj.language, 'language is defined');
			assert.isDefined(responseObj.useragent, 'useragent is defined');
			assert.match(responseObj.ipaddress, /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/, 'stored value is an ip address');
			assert.match(responseObj.language, /[a-z]{2}\-[A-Z]{2}/, 'stored value should be language code in format \'en-US\'');
			assert.isString(responseObj.useragent, 'useragent should be a string value');
			*/
			done();
		});
	});
});

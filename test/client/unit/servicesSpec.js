'use strict';

/* global inject, expect */

beforeEach(module('whoamiServices'));

describe('WhoAmI services', () => {
	let service;

	beforeEach(inject((getHeadersService) => {
		service = getHeadersService;
	}));

	it('getHeadersService factory must be defined', () => {
		expect(service).toBeDefined();
	});

	it('getHeadersService must have query method, which returns a promise', inject(($rootScope) => {
		expect(service.query).toBeDefined();
		service.query({}).$promise.then((response) =>{
			expect(response).toBeDefined();
		});
	}));

});

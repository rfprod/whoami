'use strict';

beforeEach(module('whoamiControllers'));

describe('WhoAmI controllers', () => {

	describe('indexCtrl', () => {
		let scope, ctrl, usSpinnerService, getHeadersService;

		beforeEach(inject(($rootScope, $controller, _usSpinnerService_, _getHeadersService_) => {
			scope = $rootScope.$new();
			ctrl = $controller('indexCtrl', {$scope: scope});
			usSpinnerService = _usSpinnerService_;
			spyOn(usSpinnerService,'spin').and.callThrough();
			spyOn(usSpinnerService,'stop').and.callThrough();
			getHeadersService = _getHeadersService_;
			spyOn(getHeadersService,'query').and.callThrough();
		}));
		
		it('should be defined', () => {
			expect(ctrl).toBeDefined();
		});
		
		it('should have variables and methods defined', () => {
			expect(scope.title).toBeDefined();
			
			expect(scope.buttons).toBeDefined();
			expect(scope.buttons.github).toBeDefined();
			expect(scope.buttons.whoami).toBeDefined();
			
			expect(scope.description).toBeDefined();
			expect(scope.loading).toBeDefined();
			expect(scope.error).toEqual(jasmine.objectContaining({
				noData: jasmine.any(String)
			}));
			expect(scope.serverHeaders).not.toBeDefined();
			
			expect(scope.navigator).toBeDefined();
			expect(scope.navigatorKeys).toBeDefined();
			expect(scope.navigatorExists).toBeDefined();

			expect(scope.getUserMediaCrossbrowser).toBeDefined();
			expect(scope.mediaDevices).toEqual(jasmine.any(Array));
			expect(scope.mediaDevices.length).toEqual(0);

			expect(scope.videoStream).toBeUndefined();
			expect(scope.trustSrc).toBeDefined();
			
			expect(scope.localStorage).toBeDefined();
			expect(scope.localStorageKeys).toBeDefined();
			expect(scope.localStorageExists).toBeDefined();
			
			expect(scope.sessionStorage).toBeDefined();
			expect(scope.sessionStorageKeys).toBeDefined();
			expect(scope.sessionStorageExists).toBeDefined();
			
			expect(scope.performance).toBeDefined();
			expect(scope.performanceKeys).toBeDefined();
			expect(scope.performanceExists).toBeDefined();
			
			expect(scope.bars).toBeDefined();
			expect(scope.barsKeys).toBeDefined();
			expect(scope.barsExist).toBeDefined();
			
			expect(scope.screen).toBeDefined();
			expect(scope.screenKeys).toBeDefined();
			expect(scope.screenExists).toBeDefined();
			
			expect(scope.show).toBeDefined();
			expect(scope.show.server).toBeFalsy();
			expect(scope.show.localStorage).toBeFalsy();
			expect(scope.show.sessionStorage).toBeFalsy();
			expect(scope.show.performance).toBeFalsy();
			expect(scope.show.navigator).toBeFalsy();
			expect(scope.show.bars).toBeFalsy();
			expect(scope.show.screen).toBeFalsy();
			
			expect(scope.toggleTbody).toBeDefined();
			expect(scope.isObject).toBeDefined();
			expect(scope.objectLength).toBeDefined();
			expect(scope.objectKeys).toBeDefined();
			expect(scope.extractSubObject).toBeDefined();
			
			expect(scope.getData).toBeDefined();

			expect(scope.appStats).toEqual(jasmine.any(Array));
			expect(scope.appStats.length).toEqual(0);
			expect(scope.appStatsMode).toBeDefined();
			expect(scope.appStatsMode).toBeFalsy();
			expect(scope.switchAppStatsMode).toBeDefined();
			expect(scope.showChart).toBeFalsy();
			expect(scope.chartOptions).toEqual(jasmine.any(Object));
			expect(scope.chart).toEqual(jasmine.objectContaining({
					userAgent: {
						labels: ['label 1', 'label 2', 'label 3', 'label 4', 'label 5'],
						data: [300, 500, 100, 40, 120]
					},
					acceptLanguage: {
						labels: ['label 1', 'label 2', 'label 3', 'label 4', 'label 5'],
						data: [300, 500, 100, 40, 120]
					}
			}));

			expect(scope.showModal).toBeDefined();
			expect(scope.showModal).toBeFalsy();
			expect(scope.modalText).toEqual(jasmine.objectContaining({
				title: 'Application Diagnostic Information'
			}));
			expect(scope.appDiagData).toEqual(jasmine.objectContaining({
				static: jasmine.any(Array),
				dynamic: jasmine.any(Array)
			}));
			expect(scope.toggleModal).toBeDefined();

		});
		
		it('navigatorExists should return true if navigator existst', () => {
			if (window.navigator) { expect(scope.navigatorExists()).toBeTruthy(); }
			else { expect(scope.navigatorExists()).toBeFalsy(); }
		});
		
		it('localStorageExists should return true if navigator existst', () => {
			if (window.localStorage) { expect(scope.localStorageExists()).toBeTruthy(); }
			else { expect(scope.localStorageExists()).toBeFalsy(); }
		});
		
		it('sessionStorageExists should return true if navigator existst', () => {
			if (window.sessionStorage) { expect(scope.sessionStorageExists()).toBeTruthy(); }
			else { expect(scope.sessionStorageExists()).toBeFalsy(); }
		});
		
		it('performanceExists should return true if navigator existst', () => {
			if (window.performance) { expect(scope.performanceExists()).toBeTruthy(); }
			else { expect(scope.performanceExists()).toBeFalsy(); }
		});
		
		it('barsExist should return true if navigator existst', () => {
			if (window.toolbar && window.statusbar && window.scrollbars) {
				expect(scope.barsExist()).toBeTruthy();
			}else { expect(scope.barsExist()).toBeFalsy(); }
		});
		
		it('screenExists should return true if navigator existst', () => {
			if (window.screen) { expect(scope.screenExists()).toBeTruthy(); }
			else { expect(scope.screenExists()).toBeFalsy(); }
		});
		
		it('toggleTbody should change visibility state of section details', () => {
			scope.toggleTbody({ target: { innerHTML:'server' } });
			expect(scope.show.server).toBeTruthy();
			scope.toggleTbody({ target: { innerHTML:'server' } });
			expect(scope.show.server).toBeFalsy();
			scope.toggleTbody({ target: { innerHTML:'localStorage' } });
			expect(scope.show.localStorage).toBeTruthy();
			scope.toggleTbody({ target: { innerHTML:'localStorage' } });
			expect(scope.show.localStorage).toBeFalsy();
			scope.toggleTbody({ target: { innerHTML:'sessionStorage' } });
			expect(scope.show.sessionStorage).toBeTruthy();
			scope.toggleTbody({ target: { innerHTML:'sessionStorage' } });
			expect(scope.show.sessionStorage).toBeFalsy();
			scope.toggleTbody({ target: { innerHTML:'performance' } });
			expect(scope.show.performance).toBeTruthy();
			scope.toggleTbody({ target: { innerHTML:'performance' } });
			expect(scope.show.performance).toBeFalsy();
			scope.toggleTbody({ target: { innerHTML:'nabigator' } });
			expect(scope.show.nabigator).toBeTruthy();
			scope.toggleTbody({ target: { innerHTML:'nabigator' } });
			expect(scope.show.nabigator).toBeFalsy();
			scope.toggleTbody({ target: { innerHTML:'bars' } });
			expect(scope.show.bars).toBeTruthy();
			scope.toggleTbody({ target: { innerHTML:'bars' } });
			expect(scope.show.bars).toBeFalsy();
			scope.toggleTbody({ target: { innerHTML:'screen' } });
			expect(scope.show.screen).toBeTruthy();
			scope.toggleTbody({ target: { innerHTML:'screen' } });
			expect(scope.show.screen).toBeFalsy();
		});
		
		it('isObject should return true if argument is object or false', () => {
			expect(scope.isObject({})).toBeTruthy();
			expect(scope.isObject('zz')).toBeFalsy();
		});
		
		it('objectLength should return object length if argument is object or false', () => {
			expect(scope.objectLength({})).toEqual(0);
			expect(scope.objectLength([])).toEqual(0);
			expect(scope.objectLength({'z':'z'})).toEqual(1);
			expect(scope.objectLength(['z'])).toBeTruthy(); // truthy equals > 0
			expect(scope.objectLength('zz')).toBeFalsy();
		});
		
		it('objectKeys should return object keys if argument is object or false', () => {
			expect(scope.objectKeys({})).toEqual([]);
			expect(scope.objectKeys([])).toEqual([]);
			expect(scope.objectKeys({'z':'z'})).toEqual(['z']);
			expect(scope.objectKeys(['z'])).toBeTruthy(); // truthy equals any number of keys moe than 1
			expect(scope.objectKeys('zz')).toBeFalsy();
		});
		
		it('extractSubObject should return extracted sub object if argument is object or empty object {}', () => {
			expect(scope.extractSubObject({})).toEqual({});
			expect(scope.extractSubObject([])).toEqual({});
			expect(scope.extractSubObject('zz')).toEqual({0:'z',1:'z'});
			expect(scope.extractSubObject( {'zz':{'z':'z'}} )).toEqual( {'zz':{'z':'z'}} );
		});
		
		it('getData should start spinner and call getHeadersService', () => {
			scope.getData();
			expect(scope.loading).toBeTruthy();
			expect(getHeadersService.query).toHaveBeenCalled();
		});

		it('getData spinner should start on state change', () => {
			scope.loading = true;
			scope.$digest();
			expect(usSpinnerService.spin).toHaveBeenCalled();
			scope.loading = false;
			scope.$digest();
			expect(usSpinnerService.stop).toHaveBeenCalled();
		});
		
	});

});

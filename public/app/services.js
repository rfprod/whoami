'use strict';

var whoamiServices = angular.module('whoamiServices', ['ngResource', 'ngWebSocket']);

/*
*	dynamically set backend base url to be able to deploy on any domain
*/
function setBaseUrl(absUrl) {
	//console.log('absUrl:', absUrl);
	//console.log(' >> set base URL. match', absUrl.match(new RegExp('http(s)?://[^/]+'), 'ig'));
	return absUrl.match(new RegExp('http(s)?://[^/]+'))[0];
}
var openshiftDomain = 'whoami-ecapseman.rhcloud.com'; // reconfig according to 3rd level domain issued by Openshift for the app
function setBaseWs(absUrl) {
	//console.log(' >>> setBaseWs:', absUrl);
	console.log('absUrl:', absUrl);
	var match = absUrl.match(new RegExp('://[^/]+'))[0];
	var protocol = absUrl.match(new RegExp('http(s)?(?=://)'))[0];
	console.log('ws protocol:', protocol);
	//console.log('match:', match);
	return (absUrl.length < 4 && !match) ? '' : (protocol === 'https') ? 'wss' + match : 'ws' + match;
}

whoamiServices.factory('getHeadersService', ['$resource', '$location', function($resource, $location) {
	var baseUrl = setBaseUrl($location.$$absUrl);
	console.log('getHeadersService:', baseUrl);
	return $resource(baseUrl + '/whoami', {}, {
		query: {method: 'GET', params: {}, isArray: false,
			interceptor: {
				response: function(response) {
					response.resource.$httpHeaders = response.headers;
					return response.resource;
				}
			}
		}
	});
}]);

whoamiServices.factory('getAppStats', ['$resource', '$location', function($resource, $location) {
	var baseUrl = setBaseUrl($location.$$absUrl);
	return $resource(baseUrl + '/stats', {}, {
		query: {method: 'GET', params: {}, isArray: true,
			interceptor: {
				response: function(response) {
					response.resource.$httpHeaders = response.headers;
					return response.resource;
				}
			}
		}
	});
}]);

whoamiServices.factory('getAppDiagStaticData', ['$resource', '$location', function($resource, $location) {
	var baseUrl = setBaseUrl($location.$$absUrl);
	return $resource(baseUrl + '/app-diag/static', {}, {
		query: {method: 'GET', params: {}, isArray: true,
			interceptor: {
				response: function(response) {
					response.resource.$httpHeaders = response.headers;
					return response.resource;
				}
			}
		}
	});
}]);


whoamiServices.factory('getAppDiagDynamicData', ['$websocket', '$location', function($websocket, $location) {
	var baseUrl = setBaseWs($location.$$absUrl);
	baseUrl = (baseUrl.indexOf('whoami') === -1) ? baseUrl : (baseUrl.indexOf('wss') === -1) ? baseUrl + ':8000' : baseUrl.slice(0, 6) + openshiftDomain + ':8443' ; // OpenShift specific - ws requests should be made to port :8000, wss to port :8443
	console.log('ws baseUrl', baseUrl);
	var dataStream = $websocket(baseUrl + '/app-diag/dynamic'),
		response = [],
		scope = null;

	dataStream.onOpen(function(event) {
		console.log('ws connection opened', event);
	});

	dataStream.onMessage(function(message) {
		//console.log('incoming ws message:',message);
		scope = angular.element($('modal-dashboard')).scope();
		scope.$apply(function () {
			scope.appDiagData.dynamic = [];
		});
		response = [];
		var data = JSON.parse(message.data);
		data.forEach(function(item) {
			scope.$apply(function () {
				scope.appDiagData.dynamic.push(item);
			});
			response.push(item);
		});
	});

	dataStream.onError(function(event) {
		console.log('ws connection error', event);
		dataStream.close();
	});

	dataStream.onClose(function(event) {
		console.log('ws connection closed', event);
	});

	var obj = {
		arr: response,
		status: function() {
			return dataStream.readyState;
		},
		get: function() {
			dataStream.send(JSON.stringify({ action: 'get'}));
		},
		pause: function() {
			dataStream.send(JSON.stringify({ action: 'pause'}));
		},
		close: function() {
			dataStream.close();
		}
	};
	return obj;
	//return {};
}]);


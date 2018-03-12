'use strict';

var whoamiServices = angular.module('whoamiServices', ['ngResource', 'ngWebSocket']);

/*
*	dynamically set backend base urls to be able to deploy on any domain
*/
function setBaseUrl(absUrl) {
	// console.log('absUrl:', absUrl);
	return absUrl.match(new RegExp('http(s)?://[^/]+'))[0];
}
function setBaseWs(absUrl) {
	// console.log(' >>> setBaseWs:', absUrl);
	// console.log('absUrl:', absUrl);
	const match = absUrl.match(new RegExp('://[^/]+'))[0];
	const protocol = absUrl.match(new RegExp('http(s)?(?=://)'))[0];
	// console.log('ws protocol:', protocol);
	// console.log('match:', match);
	return (absUrl.length < 4 && !match) ? '' : (protocol === 'https') ? 'wss' + match : 'ws' + match;
}

whoamiServices.factory('getHeadersService', ['$resource', '$location', function($resource, $location) {
	const baseUrl = setBaseUrl($location.$$absUrl);
	console.log('getHeadersService:', baseUrl);
	return $resource(baseUrl + '/whoami', {}, {
		query: {method: 'GET', params: {}, isArray: false,
			interceptor: {
				response: (response) => {
					response.resource.$httpHeaders = response.headers;
					return response.resource;
				}
			}
		}
	});
}]);

whoamiServices.factory('getAppStats', ['$resource', '$location', function($resource, $location) {
	const baseUrl = setBaseUrl($location.$$absUrl);
	return $resource(baseUrl + '/stats', {}, {
		query: {method: 'GET', params: {}, isArray: true,
			interceptor: {
				response: (response) => {
					response.resource.$httpHeaders = response.headers;
					return response.resource;
				}
			}
		}
	});
}]);

whoamiServices.factory('getAppDiagStaticData', ['$resource', '$location', function($resource, $location) {
	const baseUrl = setBaseUrl($location.$$absUrl);
	return $resource(baseUrl + '/app-diag/static', {}, {
		query: {method: 'GET', params: {}, isArray: true,
			interceptor: {
				response: (response) => {
					response.resource.$httpHeaders = response.headers;
					return response.resource;
				}
			}
		}
	});
}]);

whoamiServices.factory('getAppDiagDynamicData', ['$websocket', '$location', function($websocket, $location) {
	const baseUrl = setBaseWs($location.$$absUrl);
	console.log('ws baseUrl', baseUrl);
	const dataStream = $websocket(baseUrl + '/app-diag/dynamic');
	let response = [],
		scope = null;

	dataStream.onOpen((event) => {
		console.log('ws connection opened', event);
	});

	dataStream.onMessage((message) => {
		// console.log('incoming ws message:',message);
		scope = angular.element($('modal-dashboard')).scope();
		scope.$apply(() => {
			scope.appDiagData.dynamic = [];
		});
		response = [];
		const data = JSON.parse(message.data);
		data.forEach((item) => {
			scope.$apply(() => {
				scope.appDiagData.dynamic.push(item);
			});
			response.push(item);
		});
	});

	dataStream.onError((event) => {
		console.log('ws connection error', event);
		dataStream.close();
	});

	dataStream.onClose((event) => {
		console.log('ws connection closed', event);
	});

	const obj = {
		arr: response,
		status: () => dataStream.readyState,
		get: () => {
			dataStream.send(JSON.stringify({ action: 'get'}));
		},
		pause: () => {
			dataStream.send(JSON.stringify({ action: 'pause'}));
		},
		close: () => {
			dataStream.close();
		}
	};
	return obj;
}]);


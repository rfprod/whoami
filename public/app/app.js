'use strict';

var whoami = angular.module('whoami', [
	'angularSpinner',
	'ngAnimate',
	'ngResource',
	'ngRoute',
	'ngSanitize',
	'ngAria',
	'ngMessages',
	'ngMaterial',
	'whoamiControllers',
	'whoamiServices',
	'chart.js'
]);

whoami
	.config(['$routeProvider', '$locationProvider', '$mdThemingProvider', 'usSpinnerConfigProvider',
		($routeProvider, $locationProvider, $mdThemingProvider, usSpinnerConfigProvider) => {
			$routeProvider
				.when('/', {
					templateUrl: '/public/app/views/index.html',
					controller: 'indexCtrl'
				})
				.otherwise({
					redirectTo: '/'
				});

			$locationProvider.html5Mode({enabled: true, requireBase: false});

			$mdThemingProvider.theme('default')
				.primaryPalette('blue-grey')
				.accentPalette('amber')
				.warnPalette('red')
				//.backgroundPalette('blue-grey')
				.dark();

			usSpinnerConfigProvider.setDefaults({
				lines: 13, // The number of lines to draw
				length: 28, // The length of each line
				width: 14, // The line thickness
				radius: 42, // The radius of the inner circle
				scale: 1, // Scales overall size of the spinner
				corners: 1, // Corner roundness (0..1)
				color: '#fff', // #rgb or #rrggbb or array of colors
				opacity: 0.25, // Opacity of the lines
				rotate: 0, // The rotation offset
				direction: 1, // 1: clockwise, -1: counterclockwise
				speed: 1, // Rounds per second
				trail: 60, // Afterglow percentage
				fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
				zIndex: 2e9, // The z-index (defaults to 2000000000)
				className: 'spinner', // The CSS class to assign to the spinner
				top: '50vh', // Top position relative to parent
				left: '50%', // Left position relative to parent
				shadow: true, // Whether to render a shadow
				hwaccel: false, // Whether to use hardware acceleration
				position: 'fixed' // Element positioning
			});
		}
	])
	.run(['$rootScope', '$route', '$window',
		($rootScope, $route, $window) => {
			/*
			*	TODO
			*/
			console.log(' >> run > $rootScope, $route, $window:', $rootScope, $route, $window);
		}
	]);

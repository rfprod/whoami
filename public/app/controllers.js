'use strict';

var whoamiControllers = angular.module('whoamiControllers', ['angularSpinner']);

whoamiControllers.controller('indexCtrl', ['$scope', '$sce', '$window', 'usSpinnerService', 'getHeadersService', 'getAppStats', 'getAppDiagStaticData', 'getAppDiagDynamicData',
	function($scope, $sce, $window, usSpinnerService, getHeadersService, getAppStats, getAppDiagStaticData, getAppDiagDynamicData){
		$scope.title = 'WhoAmI Microservice';
		$scope.buttons = {'github':'GitHub Repo', 'diag':'App Diag', 'whoami':'Know Who You Are', 'stats': 'Application Usage Stats'};
		$scope.description = 'Shows details about your computer';
		$scope.loading = true;
		$scope.$watch('loading', function(newValue) {
			if (newValue) { usSpinnerService.spin('root-spinner'); }
			if (!newValue) { usSpinnerService.stop('root-spinner'); }
		});
		$scope.error = {
			noData: 'No data'
		};
		$scope.serverHeaders = undefined;
		$scope.navigator = {};
		$scope.navigatorKeys = Object.keys($scope.navigator);
		$scope.$watch('navigator', function(newValue){
			$scope.navigatorKeys = Object.keys(newValue);
		});
		$scope.navigatorExists = function() {
			return (navigator) ? true : false;
		};
		$scope.getUserMediaCrossbrowser = function() {
			return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || null;
		};
		$scope.mediaDevices = [];
		$scope.videoStream = undefined;
		$scope.trustSrc = function(src) {
			return $sce.trustAsResourceUrl(src);
		};
		$scope.localStorage = {};
		$scope.localStorageKeys = Object.keys($scope.localStorage);
		$scope.$watch('localStorage', function(newValue){
			$scope.localStorageKeys = Object.keys(newValue);
			console.log('newValue:', newValue);
		});
		$scope.localStorageExists = function(){
			return ($window.localStorage) ? true : false;
		};
		$scope.sessionStorage = {};
		$scope.sessionStorageKeys = Object.keys($scope.sessionStorage);
		$scope.$watch('sessionStorage', function(newValue){
			$scope.sessionStorageKeys = Object.keys(newValue);
		});
		$scope.sessionStorageExists = function(){
			return ($window.sessionStorage) ? true : false;
		};
		$scope.performance = {};
		$scope.performanceKeys = Object.keys($scope.performance);
		$scope.$watch('performance', function(newValue){
			$scope.performanceKeys = Object.keys(newValue);
		});
		$scope.performanceExists = function(){
			return ($window.performance) ? true : false;
		};
		$scope.bars = {};
		$scope.barsKeys = Object.keys($scope.bars);
		$scope.$watch('bars', function(newValue){
			$scope.barsKeys = Object.keys(newValue);
		});
		$scope.barsExist = function(){
			return ($window.toolbar && $window.statusbar && $window.scrollbars) ? true : false;
		};
		$scope.screen = {};
		$scope.screenKeys = Object.keys($scope.bars);
		$scope.$watch('screen', function(newValue){
			$scope.screenKeys = Object.keys(newValue);
		});
		$scope.screenExists = function(){
			return ($window.screen) ? true : false;
		};
		$scope.show = { // initialize tbodies display state
			server: false,
			localStorage: false,
			sessionStorage: false,
			performance: false,
			navigator: false,
			bars: false,
			screen: false,
			stats: true
		};
		$scope.toggleTbody = function(event, section){
			var key = (!section) ? event.target.innerHTML : section;
			$scope.show[key] = ($scope.show[key]) ? false : true;
		};
		$scope.isObject = function(value) {
			if (typeof value === 'object') { return true; }
			return false;
		};
		$scope.objectLength = function(value) {
			if (typeof value === 'object') { return Object.keys(value).length; }
			return false;
		};
		$scope.objectKeys = function(value) {
			if (typeof value === 'object') { return Object.keys(value); }
			return false;
		};
		$scope.extractSubObject = function(targetObj){
			var result = {};
			for (var subkey in targetObj){
				if (typeof targetObj[subkey] !== 'function' && targetObj[subkey] !== null) {
					result[subkey] = targetObj[subkey];
				}
			}
			return result;
		};
		$scope.getData = function(){
			if ($scope.appStatsMode) { $scope.switchAppStatsMode(); }
			//console.log($window);
			$scope.loading = true;
			getHeadersService.query({}).$promise.then(function(response){
				$scope.serverHeaders = response;
				$scope.loading = false;
			});
			var key;
			if ($scope.navigatorExists()) {
				for (key in navigator){
					if (typeof navigator[key] !== 'object'){
						if (typeof navigator[key] === 'function'){
							console.log('navigator function found, ignoring');
							/*
							*   TODO - do something with navigator functions
							*
							*   $scope.navigatorFunctions[key] = navigator[key];
							*/
						}else { $scope.navigator[key] = navigator[key]; }
					}else {
						$scope.navigator[key] = $scope.extractSubObject(navigator[key]);
						//console.log('navigator ', key, $scope.navigator[key]);
					}
				}
				// get media devices
				if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
					navigator.mediaDevices.enumerateDevices().then(function(devices) {
						devices.forEach(function(item) {
							console.log('device:', item);
							$scope.mediaDevices.push(item);
						});
					});
				}
				// init webRTC
				navigator.getUserMedia = $scope.getUserMediaCrossbrowser();
				if (navigator.getUserMedia) {
					navigator.getUserMedia(
						{
							video: {
								width: {
									min: 320
								},
								height: {
									min: 240
								}
							},
							audio: true
						},
						function(stream) {
							console.log('getUserMedia success', stream);
							$scope.videoStream = $window.URL.createObjectURL(stream);
						},
						function(error) {
							console.log('getUserMedia error:', error);
							$scope.videoStream = 'http://techslides.com/demos/sample-videos/small.webm';
						}
					);
				}
			}
			if ($window.localStorage) {
				for (key in $window.localStorage){
					if (typeof $window.localStorage[key] !== 'object'){
						if (typeof $window.localStorage[key] === 'function'){
							console.log('performance function found, ignoring');
							/*
							*   TODO - do something with localStorage functions
							*/
						}else { $scope.localStorage[key] = $window.localStorage[key]; }
					}else {
						$scope.localStorage[key] = $scope.extractSubObject($window.localStorage[key]);
						//console.log('localStorage ', key, $scope.localStorage[key]);
					}
				}
			}
			if ($window.sessionStorage) {
				for (key in $window.sessionStorage){
					if (typeof $window.sessionStorage[key] !== 'object'){
						if (typeof $window.sessionStorage[key] === 'function'){
							console.log('performance function found, ignoring');
							/*
							*   TODO - do something with sessionStorage functions
							*/
						}else { $scope.sessionStorage[key] = $window.sessionStorage[key]; }
					}else {
						$scope.sessionStorage[key] = $scope.extractSubObject($window.sessionStorage[key]);
						//console.log('sessionStorage ', key, $scope.sessionStorage[key]);
					}
				}
			}
			if ($window.performance) {
				for (key in $window.performance){
					if (typeof $window.performance[key] !== 'object'){
						if (typeof $window.performance[key] === 'function'){
							console.log('performance function found, ignoring');
							/*
							*   TODO - do something with performance functions
							*/
						}else { $scope.performance[key] = $window.performance[key]; }
					}else {
						$scope.performance[key] = $scope.extractSubObject($window.performance[key]);
						//console.log('performance ', key, $scope.performance[key]);
					}
				}
			}
			if ($window.statusbar) {
				$scope.bars.statusbar = $window.statusbar.visible;
				//console.log('$scope.bars.statusbar',$scope.bars.statusbar);
			}
			if ($window.toolbar) {
				$scope.bars.toolbar = $window.toolbar.visible;
				//console.log('$scope.bars.toolbar',$scope.bars.toolbar);
			}
			if ($window.scrollbars) {
				$scope.bars.scrollbars = $window.scrollbars.visible;
				//console.log('$scope.bars.scrollbars',$scope.bars.scrollbars);
			}
			if ($window.locationbar) {
				$scope.bars.locationbar = $window.locationbar.visible;
				//console.log('$scope.bars.locationbar',$scope.bars.locationbar);
			}
			if ($window.menubar) {
				$scope.bars.menubar = $window.menubar.visible;
				//console.log('$scope.bars.menubar',$scope.bars.menubar);
			}
			if ($window.personalbar) {
				$scope.bars.personalbar = $window.personalbar.visible;
				//console.log('$scope.bars.personalbar',$scope.bars.personalbar);
			}
			if ($window.screen) {
				for (key in $window.screen){
					if (typeof $window.screen[key] !== 'object'){
						if (typeof $window.screen[key] === 'function'){
							console.log('screen function found, ignoring');
							/*
							*   TODO - do something with screen functions
							*/
						}else { $scope.screen[key] = $window.screen[key]; }
					}else {
						$scope.screen[key] = $scope.extractSubObject($window.screen[key]);
						//console.log('screen ', key, $scope.screen[key]);
					}
				}
			}
		};

		$scope.appStats = [];
		$scope.appStatsMode = false;
		$scope.switchAppStatsMode = function(){
			($scope.appStatsMode) ? $scope.appStatsMode = false : $scope.appStatsMode = true;
			if ($scope.appStatsMode) {
				$scope.loading = true;
				getAppStats.query({}).$promise.then(function(response){
					$scope.appStats = response;
					console.log('$scope.appStats:', $scope.appStats);
					$scope.loading = false;
				});
			}
		};
		$scope.showChart = false;
		$scope.$watch('appStats', function(newValue){
			if (newValue !== []) {
				console.log('app stats newValue',newValue);
				$scope.chart.userAgent.labels = [];
				$scope.chart.userAgent.data = [];
				$scope.chart.acceptLanguage.labels = [];
				$scope.chart.acceptLanguage.data = [];
				newValue.forEach(function(item){
					console.log('item',item);
					var languageArr = item.serverHeaders[0].acceptLanguage;
					languageArr.forEach(function(langItem){
						var langItemIndex = $scope.chart.acceptLanguage.labels.indexOf(langItem);
						if (langItemIndex === -1){
							$scope.chart.acceptLanguage.labels.push(langItem);
							$scope.chart.acceptLanguage.data.push(1);
						}else{
							$scope.chart.acceptLanguage.data[langItemIndex]++;
						}
					});
					var agentArr = item.serverHeaders[0].userAgent;
					agentArr.forEach(function(agentItem){
						var agentSubstr = agentItem.substring(agentItem.lastIndexOf(' ')+1,agentItem.length);
						var agentItemIndex = $scope.chart.userAgent.labels.indexOf(agentSubstr);
						if (agentItemIndex === -1){
							$scope.chart.userAgent.labels.push(agentSubstr);
							$scope.chart.userAgent.data.push(1);
						}else{
							$scope.chart.userAgent.data[agentItemIndex]++;
						}
					});
				});
				$scope.showChart = true;
				console.log('$scope.chart: ',$scope.chart);
			}
		});
		$scope.chartOptions = {
			// see chartjs.org/docs#doughnut-pie-chart-chart-options for options
			responsive: true,
			tooltipFontSize: 18
		};
		$scope.chart = {
			userAgent: {
				labels: ['label 1', 'label 2', 'label 3', 'label 4', 'label 5'],
				data: [300, 500, 100, 40, 120]
			},
			acceptLanguage: {
				labels: ['label 1', 'label 2', 'label 3', 'label 4', 'label 5'],
				data: [300, 500, 100, 40, 120]
			}
		};

		$scope.showModal = false;
		$scope.modalText = {title: 'Application Diagnostic Information'};
		$scope.appDiagData = {
			static: [],
			dynamic: []
		};
		$scope.toggleModal = function(){
			$scope.showModal = (!$scope.showModal) ? true : false;
			if ($scope.showModal) {
				$scope.loading = true;
				getAppDiagStaticData.query({}).$promise.then(function(response){
					$scope.appDiagData.static = response;
					$scope.loading = false;
				});
				getAppDiagDynamicData.status();
				getAppDiagDynamicData.get();
			}else{
				getAppDiagDynamicData.pause();
			}
		};
		
		$scope.$on('$viewContentLoaded', function() {
			console.log('controller initialized');
			$scope.getData();
		});
		$scope.$on('$destroy', function() {
			console.log('controller destroyed');
		});
	}
]);

var config = setDefaultSettings();
var db;
var stuffMapp = angular
.module('stuffMapp', config.modules)
.factory('$userData', function() {
	var data = { loggedIn: $('html').hasClass('loggedIn'), braintreeToken: '', FirstName: '', LastName: '', email: '', userId: 0 };
	return {
		isLoggedIn: function () { return data.loggedIn; },
		setLoggedIn: function (loggedIn) { data.loggedIn = loggedIn; },
		getFirstName: function () { return data.FirstName; },
		setFirstName: function (firstName) { data.FirstName = firstName; },
		getLastName: function () { return data.LastName; },
		setLastName: function (lastName) { data.LastName = lastName; },
		getUserId: function () { return data.UserId; },
		setUserId: function (userId) { data.UserId = userId; },
		getEmail: function () { return data.Email; },
		setEmail: function (email) { data.Email = email; },
		getBraintreeToken: function () { return data.braintreeToken; },
		setBraintreeToken: function (braintreeToken) { data.braintreeToken = braintreeToken; },
		clearData: function () {
			data = { FirstName: '', LastName: '', email: '', userId: 0, braintreeToken: '' };
		}
	};
})
.factory('$stuffTabs', function() {
	return {
		init : function($scope, e) {
			$(e).addClass('selected');
			$scope.$on('$destroy', function() {
				$(e).removeClass('selected');
			});
		}
	};
})
.factory('authenticator', function getSession($http, $q) {
	var deferred = $q.defer();
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status')
	.success(function (data) { deferred.resolve(data); })
	.error(function (msg) { deferred.reject(msg); });
	return deferred.promise;
})
.directive('repeatDone', function() {
	return function(scope, element, attrs) {
		if(scope.$last) scope.$eval(attrs.repeatDone);
	};
})
.filter('reverse', function() {
	return function(items) {
		if(items) return items.slice().reverse();
	};
});

if(config.ionic.isIonic) {
	// stuffMapp.module('starter').factory('QuickActionService', ['$rootScope', '$q', QuickActionService]);
	// function QuickActionService($rootScope, $q) {
	//
	// 	function check3DTouchAvailability() {
	// 		return $q(function(resolve, reject) {
	// 			if (window.ThreeDeeTouch) {
	// 				window.ThreeDeeTouch.isAvailable(function (available) {
	// 					resolve(available);
	// 				});
	// 			} else {
	// 				reject();
	// 			}
	// 		});
	// 	}
	//
	// 	function configure() {
	// 		// Check if 3D Touch is supported on the device
	// 		check3DTouchAvailability().then(function(available) {
	//
	// 			if (available) {    // Comment out this check if testing in simulator
	//
	// 				// Configure Quick Actions
	// 				window.ThreeDeeTouch.configureQuickActions([
	// 					{
	// 						type: 'newNote',
	// 						title: 'New Note',
	// 						subtitle: '',
	// 						iconType: 'compose'
	// 					}
	// 				]);
	//
	// 				// Set event handler to check which Quick Action was pressed
	// 				window.ThreeDeeTouch.onHomeIconPressed = function(payload) {
	// 					if (payload.type == 'newNote') {
	// 						$rootScope.$broadcast('newNoteQuickAction');
	// 					}
	// 				};
	// 			}
	// 		});
	// 	}
	// 	return {
	// 		configure: configure
	// 	};
	// }
	// $rootScope.$on('newNoteQuickAction', function() {
	// 	vm.showNewNoteModal();
	// });
	stuffMapp.run(function($ionicPlatform, $cordovaSQLite/*, QuickActionService*/) {
		$ionicPlatform.ready(function() {
			if(window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if(window.StatusBar) {
				StatusBar.styleDefault();
			}
			db = $cordovaSQLite.openDB({name:'stuffmapper.db', location: 'default'});
			//var deploy = new Ionic.Deploy();

			// Update app code with new release from Ionic Deploy
			// 	$scope.doUpdate = function() {
			// 		deploy.update().then(function(res) {
			// 			console.log('Ionic Deploy: Update Success! ', res);
			// 		}, function(err) {
			// 			console.log('Ionic Deploy: Update error! ', err);
			// 		}, function(prog) {
			// 			console.log('Ionic Deploy: Progress... ', prog);
			// 		});
			// 	};
			//
			// 	// Check Ionic Deploy for new code
			// 	$scope.checkForUpdates = function() {
			// 		console.log('Ionic Deploy: Checking for updates');
			// 		deploy.check().then(function(hasUpdate) {
			// 			console.log('Ionic Deploy: Update available: ' + hasUpdate);
			// 			$scope.hasUpdate = hasUpdate;
			// 		}, function(err) {
			// 			console.error('Ionic Deploy: Unable to check for updates', err);
			// 		});
			// 	};
			// });

			//$scope.checkForUpdates();
			//QuickActionService.configure();
		});
	}).directive('goButton', function () {
		return function (scope, element, attrs) {
			element.bind('keydown keypress', function (event) {
				if(event.which === 13) {
					scope.$apply(function (){
						scope.$eval(attrs.goButton);
					});

					event.preventDefault();
				}
			});
		};
	});
}

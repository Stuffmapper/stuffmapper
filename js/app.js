
var config = setDefaultSettings();
var stuffMapp = angular
.module('stuffMapp', config.modules)
.factory('$userData', function() {
	var data = { loggedIn: $('html').hasClass('loggedIn'), FirstName: '', LastName: '', email: '', userId: 0 };
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
		clearData: function () {
			data = { FirstName: '', LastName: '', email: '', userId: 0 };
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
.service('authenticator', ['$http', '$q', function ($http, $q) {
	var deferred = $q.defer();
	$http.post(config.api.host + 'api/' + config.api.version + '/account/status')
	.success(function (data) { deferred.resolve(data); })
	.error(function (msg) { deferred.reject(msg); });
	return deferred.promise;
}])
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
	stuffMapp.run(function($ionicPlatform) {
		$ionicPlatform.ready(function() {
			if(window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if(window.StatusBar) {
				StatusBar.styleDefault();
			}
		});
	});
}

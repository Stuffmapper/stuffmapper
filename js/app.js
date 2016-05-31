var config = setDefaultConfig();
var stuffMapp = angular
.module('stuffMapp', config.modules)
.controller("MainController", MainController)
.config(appConfig)
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
	$http({
		method: 'POST',
		url: '/api/v1/account/status',
		cache: false
	}).success(function (data) {
		deferred.resolve(data);
	}).error(function (msg) {
		deferred.reject(msg);
	});
	return deferred.promise;
}])
.directive('repeatDone', function() {
	return function(scope, element, attrs) {
		if(scope.$last) scope.$eval(attrs.repeatDone);
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

function appConfig($locationProvider, $stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/stuff/get');
	$locationProvider.html5Mode(config.html5);
	$stateProvider
	.state('stuff', {
		url: '/stuff',
		templateUrl: 'templates/partial-home.html',
		controller: StuffController
	})
	.state('stuff.get', {
		url: '/get',
		templateUrl: 'templates/partial-home-getstuff.html',
		controller: GetStuffController
	})
	.state('stuff.get.item', { //  http://www.stuffmapper.com/stuff/get/232
		url: '/:id',
		controller: GetItemController
	})
	.state('stuff.give', { //  http://www.stuffmapper.com/stuff/give#step1
		url: '/give',
		templateUrl: 'templates/partial-home-givestuff.html',
		controller: GiveStuffController,
		resolve: {
			authenticated: ['authenticator', function (authenticated) {
				return authenticated;
			}]
		}
	})
	.state('stuff.my', {
		url: '/my',
		templateUrl: 'templates/partial-home-my.html',
		controller: MyController,
		resolve: {
			authenticated: ['authenticator', function (authenticated) {
				return authenticated;
			}]
		}
	})
	.state('stuff.my.items', {
		url: '/items',
		templateUrl: 'templates/partial-home-mystuff.html',
		controller: MyStuffController
	})
	.state('stuff.my.items.item', {
		url: '/:id',
		controller: MyStuffItemController
	})
	.state('stuff.my.messages', {
		url: '/messages',
		templateUrl: 'templates/partial-home-messages.html',
		controller: MessagesController
	})
	.state('stuff.my.watchlist', {
		url: '/watchlist',
		templateUrl: 'templates/partial-home-watchlist.html',
		controller: WatchListController
	})
	.state('stuff.my.settings', {
		url: '/settings',
		templateUrl: 'templates/partial-home-settings.html',
		controller: SettingsController
	})
	.state('about', {
		url: '/about',
		templateUrl: 'templates/partial-about.html',
		controller: AboutController
	});
}

function setDefaultConfig() {
	var isIonic = $('html').hasClass('ionic');
	var isDev = $('html').hasClass('dev') || $('html').hasClass('test');
	var modules = ['ui.router', 'ngAnimate'];
	if(isIonic) modules.push('ionic');
	return {
		ionic : {
			isIonic : isIonic
		},
		modules : modules,
		api : {
			host : isIonic?
			isDev?
			'//localhost/':
			/*'//www.stuffmapper.com/'*/'//localhost:3000/':
			'/',
			version : 'v1'
		},
		html5 : !!window.history && !!window.history.pushState
	};
}

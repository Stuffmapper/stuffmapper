var config = setDefaultConfig();
var stuffMapp = angular
.module('stuffMapp', config.modules)
.controller('MainController', MainController)
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

function appConfig($locationProvider, $stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/stuff/get');
	$locationProvider.html5Mode(config.html5);
	$stateProvider
	.state('stuff', config.providers.stuff)
	.state('stuff.get', config.providers.getStuff)
	.state('stuff.get.item', config.providers.getItem)
	.state('stuff.give', config.providers.giveStuff)
	.state('stuff.my', config.providers.my)
	.state('stuff.my.items', config.providers.myStuff)
	.state('stuff.my.items.item', config.providers.myItem)
	.state('stuff.my.messages', config.providers.myMessages)
	.state('stuff.my.watchlist', config.providers.myWatchlist)
	.state('stuff.my.settings', config.providers.mySettings)
	.state('about', config.providers.about);
}

function setDefaultConfig() {
	var isIonic = $('html').hasClass('ionic');
	var isDev = $('html').hasClass('dev') || $('html').hasClass('test');
	var modules = ['ui.router', 'ngAnimate'];
	var providers = {
		stuff : {
			url: '/stuff',
			templateUrl: 'templates/partial-home.html',
			controller: StuffController
		},
		getStuff : {
			url: '/get',
			templateUrl: 'templates/partial-home-getstuff.html',
			controller: GetStuffController
		},
		getItem : {
			url: '/:id',
			controller: GetItemController
		},
		giveStuff : {
			url: '/give',
			templateUrl: 'templates/partial-home-givestuff.html',
			controller: GiveStuffController,
			resolve: {
				authenticated: ['authenticator', function (authenticated) {
					return authenticated;
				}]
			}
		},
		my : {
			url: '/my',
			templateUrl: 'templates/partial-home-my.html',
			controller: MyController,
			resolve: {
				authenticated: ['authenticator', function (authenticated) {
					return authenticated;
				}]
			}
		},
		myStuff : {
			url: '/items',
			templateUrl: 'templates/partial-home-mystuff.html',
			controller: MyStuffController
		},
		myItem : {
			url: '/:id',
			controller: MyItemController
		},
		myMessages : {
			url: '/messages',
			templateUrl: 'templates/partial-home-messages.html',
			controller: MessagesController
		},
		myWatchlist : {
			url: '/watchlist',
			templateUrl: 'templates/partial-home-watchlist.html',
			controller: WatchListController
		},
		mySettings : {
			url: '/settings',
			templateUrl: 'templates/partial-home-settings.html',
			controller: SettingsController
		},
		about : {
			url: '/about',
			templateUrl: 'templates/partial-about.html',
			controller: AboutController
		}
	};
	if(isIonic) {
		modules.push('ionic');
		modules.push('ngCordova');
		Object.keys(providers).forEach(function(key) {
			if(!providers[key].resolve) {
				providers[key].resolve = {
					authenticated: ['authenticator', function (authenticated) {
						return authenticated;
					}]
				};
			}
		});
	}
	return {
		ionic : {
			isIonic : isIonic
		},
		modules : modules,
		api : {
			host : isDev?'/':'http://ducks.stuffmapper.com:3000/',
			version : 'v1'
		},
		html5 : !!window.history && !!window.history.pushState,
		providers : providers
	};
}

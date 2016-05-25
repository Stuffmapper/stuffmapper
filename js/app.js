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
		controller: function($scope, $userData) {
			$scope.mapbox = false;
			if($scope.mapbox) {
				if (mapboxgl.supported()) {
					mapboxgl.accessToken = 'pk.eyJ1Ijoic3R1ZmZtYXBwZXIiLCJhIjoiY2lvZ2NybTBxMDFqenl2bTJrMWFvY3d2aSJ9.IY-ULtTMhRWqw8WbJQ0k5Q';
					$scope.map = new mapboxgl.Map({
						container: 'map-view',
						style: 'mapbox://styles/mapbox/basic-v8', //stylesheet location
						center: [-122.335167, 47.608013],
						zoom: 13
					});
				}
				else {
					L.mapbox.accessToken = 'pk.eyJ1Ijoic3R1ZmZtYXBwZXIiLCJhIjoiY2lvZ2NybTBxMDFqenl2bTJrMWFvY3d2aSJ9.IY-ULtTMhRWqw8WbJQ0k5Q';
					$scope.map = L.mapbox.map('map-view', 'mapbox.basic')
					.setView([47.608013, -122.335167], 13);
				}
			} else {
				// styles: https://snazzymaps.com/explore?sort=popular
				var style = [
					[],
					[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#333739"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2ecc71"}]},{"featureType":"poi","stylers":[{"color":"#2ecc71"},{"lightness":-7}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-28}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"visibility":"on"},{"lightness":-15}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-18}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-34}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#333739"},{"weight":0.8}]},{"featureType":"poi.park","stylers":[{"color":"#2ecc71"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#333739"},{"weight":0.3},{"lightness":10}]}],
					[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#48c0eb"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#8bc34a"}]},{"featureType":"poi","stylers":[{"color":"#8bc34a"},{"lightness":-7}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"lightness":-28}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"visibility":"on"},{"lightness":-15}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"lightness":-18}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"lightness":-34}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#48c0eb"},{"weight":0.8}]},{"featureType":"poi.park","stylers":[{"color":"#8bc34a"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#48c0eb"},{"weight":0.3},{"lightness":10}]}]
				];
				var styledMap = new google.maps.StyledMapType(style[2], {name: "Styled Map"});
				var mapOptions = {
					zoom: 13,
					center: {
						lat: 47.608013,
						lng: -122.335167
					},
					mapTypeControlOptions: {
						mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
					}
				};
				$scope.map = new google.maps.Map($('#map-view')[0], mapOptions);
				$scope.map.mapTypes.set('map_style', styledMap);
				$scope.map.setMapTypeId('map_style');
			}
			$userData.setUserId(1);
		}
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
		templateUrl: 'templates/partial-home-mystuff.html',
		controller: MyStuffController,
		resolve: {
			authenticated: ['authenticator', function (authenticated) {
				return authenticated;
			}]
		}
	})
	.state('stuff.my.item', {
		url: '/:id',
		controller: MyStuffItemController,
		resolve: {
			authenticated: ['authenticator', function (authenticated) {
				return authenticated;
			}]
		}
	})
	.state('stuff.messages', {
		url: '/messages',
		templateUrl: 'templates/partial-home-messages.html',
		controller: MessagesController,
		resolve: {
			authenticated: ['authenticator', function (authenticated) {
				return authenticated;
			}]
		}
	})
	.state('stuff.watchlist', {
		url: '/watchlist',
		templateUrl: 'templates/partial-home-watchlist.html',
		controller: WatchlistController,
		resolve: {
			authenticated: ['authenticator', function (authenticated) {
				return authenticated;
			}]
		}
	})
	.state('stuff.settings', {
		url: '/watchlist',
		templateUrl: 'templates/partial-home-settings.html',
		controller: SettingsController,
		resolve: {
			authenticated: ['authenticator', function (authenticated) {
				return authenticated;
			}]
		}
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

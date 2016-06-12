function setDefaultSettings() {
	var isIonic = $('html').hasClass('ionic');
	var isDev = $('html').hasClass('dev') || $('html').hasClass('test');
	var modules = ['ui.router', 'ngAnimate'];
	var providers = {
		stuff : {
			url: '/stuff',
			templateUrl: 'templates/partial-home.html',
			controller: 'stuffController'
		},
		getStuff : {
			url: '/get',
			templateUrl: 'templates/partial-home-getstuff.html',
			controller: 'getStuffController'
		},
		getItem : {
			url: '/:id',
			controller: 'getItemController'
		},
		giveStuff : {
			url: '/give',
			templateUrl: 'templates/partial-home-givestuff.html',
			controller: 'giveController',
			resolve: {
				authenticated: ['authenticator', function (authenticated) {
					return authenticated;
				}]
			}
		},
		my : {
			url: '/my',
			templateUrl: 'templates/partial-home-my.html',
			controller: 'myController',
			resolve: {
				authenticated: ['authenticator', function (authenticated) {
					return authenticated;
				}]
			}
		},
		myStuff : {
			url: '/items',
			templateUrl: 'templates/partial-home-mystuff.html',
			controller: 'myStuffController'
		},
		myItem : {
			url: '/:id',
			controller: 'myItemController'
		},
		myMessages : {
			url: '/messages',
			templateUrl: 'templates/partial-home-messages.html',
			controller: 'messagesController'
		},
		myConversation : {
			url: '/messages/:id',
			templateUrl: 'templates/partial-home-conversation.html',
			controller: 'conversationController'
		},
		myWatchlist : {
			url: '/watchlist',
			templateUrl: 'templates/partial-home-watchlist.html',
			controller: 'watchlistController'
		},
		mySettings : {
			url: '/settings',
			templateUrl: 'templates/partial-home-settings.html',
			controller: 'settingsController'
		},
		about : {
			url: '/about',
			templateUrl: 'templates/partial-about.html',
			controller: 'aboutController'
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

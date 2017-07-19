function setDefaultSettings() {
	var isIonic = $('html').hasClass('ionic');
	var isElectron = $('html').hasClass('electron');
	var isDev = $('html').hasClass('dev') || $('html').hasClass('test');
	var modules = ['ui.router', 'ngAnimate', 'ui.utils', 'ngSanitize', 'ui.router.metatags'];
	var providers = {
		stuff : {
			url: '/stuff',
			templateUrl: 'templates/partial-home.html',
			controller: 'stuffController'
		},
		getStuff : {
			url: '/get',
			templateUrl: 'templates/partial-home-getstuff.html',
			controller: 'getStuffController',
			metaTags: {
				title: 'Get Stuff - Stuffmapper',
				description: 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
				keywords: 'stuffmapper, free stuff, give stuff, reusable stuff, get stuff',
				properties: {
					'og:title': 'Get Stuff - Stuffmapper',
					'og:description': 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
					'og:image': 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
					'og:url': subdomain+'/stuff/get',
					'og:type': 'website'
				}
			}
		},
		getItem : {
			url: '/:id',
			controller: 'getItemController',
			resolve: {
				item: ['$stateParams', '$http', function ($stateParams, $http) {
					return $http.get(config.api.host + '/api/v' + config.api.version + '/stuff/id/' + $stateParams.id);
				}]
			},
			metaTags: {
				title: ['item', function (item) { return item.data.err?'':(item.data.res.title.trim()?item.data.res.title.trim()+' - Stuffmapper': 'No Item Found'+' - Stuffmapper') }],
				description: ['item', function (item) { return item.data.err?'':(item.data.res.description.trim()?item.data.res.description.trim():'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!')}],
				keywords: 'stuffmapper, free stuff, give stuff, reusable stuff, get stuff',
				properties: {
					'og:title': ['item', function (item) { return item.data.err?'':(item.data.res.title?item.data.res.title.trim(): 'No Item Found'+' - Stuffmapper') }],
					'og:description': ['item', function (item) { return item.data.err?'':(item.data.res.description.trim()?item.data.res.description.trim():'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!') }],
					'og:image': ['item', function (item) { return item.data.err?'':(item.data.res.image_url?'https://cdn.stuffmapper.com'+item.data.res.image_url:'https://www.stuffmapper.com/img/stuffmapper-logo.png') }],
					'og:url': ['item', function (item) { return item.data.err?'':(item.data.res.id?subdomain+'/stuff/get/'+item.data.res.id: '') }]
				}
			}
		},
		giveStuff : {
			url: '/give',
			templateUrl: 'templates/partial-home-givestuff.html',
			controller: 'giveController',
			resolve: {
				authenticated: ['authenticator', function (authenticated) {
					return authenticated;
				}]
			},
			metaTags: {
				title: 'Give Stuff - Stuffmapper',
				description: 'Get ready to give stuff!',
				keywords: 'stuffmapper, free stuff, give stuff, reusable stuff, get stuff',
				properties: {
					'og:title': 'Give Stuff - Stuffmapper',
					'og:description': 'Get ready to give stuff!',
					'og:image': 'https://www.stuffmapper.com/img/give-pic-empty-01.png',
					'og:url': subdomain+'/stuff/give'
				}
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
			cache: false,
			templateUrl: 'templates/partial-home-mystuff.html',
			controller: 'myStuffController',
			metaTags: {
				title: 'My Stuff - Stuffmapper',
				description: 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
				keywords: 'stuffmapper, free stuff, give stuff, reusable stuff, get stuff',
				properties: {
					'og:title': 'My Stuff - Stuffmapper',
					'og:description': 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
					'og:image': 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
					'og:url': subdomain+'/stuff/my/items',
					'og:type': 'website'
				}
			}
		},
		myItem : {
			url: '/:id',
			templateUrl: 'templates/partial-home-myitem.html',
			controller: 'myItemsController'
		},
		myConversation : {
			url: '/messages',
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
		loginSteps : {
			url: '/login-steps',
			templateUrl: 'templates/partial-login-steps.html',
			controller: 'loginStepsController'
		},
		loginSetupOne : {
			url: '/login-setup1',
			templateUrl: 'templates/partial-login-setup1.html',
			controller: 'loginSetupOneController'
		},
		loginSetupTwo : {
			url: '/login-setup2',
			templateUrl: 'templates/partial-login-setup2.html',
			controller: 'loginSetupTwoController'
		},
		loginPage : {
			url: '/login-page',
			templateUrl: 'templates/partial-login-page.html',
			controller: 'loginPageController'
		},
		about : {
			url: '/about',
			templateUrl: 'templates/partial-about.html',
			metaTags: {
				title: 'About - Stuffmapper',
				description: 'Our mission is to save millions of items from landfills everywhere and our vision is to support and grow the free reusable stuff movement.',
				keywords: 'stuffmapper, free stuff, give stuff, reusable stuff, get stuff',
				properties: {
					'og:title': 'About - Stuffmapper',
					'og:description': 'Our mission is to save millions of items from landfills everywhere and our vision is to support and grow the free reusable stuff movement.',
					'og:image': 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
					'og:url': subdomain+'/about'
				}
			}
		},
		privacy : {
			url: '/privacy',
			templateUrl: 'templates/partial-privacy.html',
			metaTags: {
				title: 'Privacy Policy - Stuffmapper',
				description: 'Stuffmapper SPC ("Stuffmapper") is committed to creating and maintaining a trusted community, and takes precautions to prevent unauthorized access to or misuse of data about you. Stuffmapper does not share personally identifiable user data with third parties.',
				keywords: 'stuffmapper, free stuff, give stuff, reusable stuff, get stuff',
				properties: {
					'og:title': 'Privacy Policy - Stuffmapper',
					'og:description': 'Stuffmapper SPC ("Stuffmapper") is committed to creating and maintaining a trusted community, and takes precautions to prevent unauthorized access to or misuse of data about you. Stuffmapper does not share personally identifiable user data with third parties.',
					'og:image': 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
					'og:url': subdomain+'/privacy'
				}
			}
		},
		faq : {
			url: '/faq',
			templateUrl: 'templates/partial-faq.html',
			controller: 'faqController',
			metaTags: {
				title: 'What is Stuffmapper?',
				description: 'Our goal is to save millions of items from landfills everywhere and to support and grow the free reusable stuff movement by connecting people who want to give and get free reusable items.',
				keywords: 'stuffmapper, free stuff, give stuff, reusable stuff, get stuff',
				properties: {
					'og:title': 'What is Stuffmapper?',
					'og:description': 'Our goal is to save millions of items from landfills everywhere and to support and grow the free reusable stuff movement by connecting people who want to give and get free reusable items.',
					'og:image': 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
					'og:url': subdomain+'/faq'
				}
			}
		},
		useragreement : {
			url: '/useragreement',
			templateUrl: 'templates/partial-useragreement.html',
			controller: 'userAgreementController',
			metaTags: {
				title: 'Terms of Service - Stuffmapper',
				description: 'Our goal is to save millions of items from landfills everywhere and to support and grow the free reusable stuff movement by connecting people who want to give and get free reusable items.',
				keywords: 'stuffmapper, free stuff, give stuff, reusable stuff, get stuff',
				properties: {
					'og:title': 'Terms of Service - Stuffmapper',
					'og:description': 'Our goal is to save millions of items from landfills everywhere and to support and grow the free reusable stuff movement by connecting people who want to give and get free reusable items.',
					'og:image': 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
					'og:url': subdomain+'/useragreement'
				}
			}
		}
	};
	if(isIonic) {
		modules.push('ionic');
		modules.push('ngCordova');
		// modules.push('ngCordovaOauth');
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
		electron : {
			isElectron: isElectron
		},
		modules : modules,
		api : {
			host : subdomain,
			version : 1
		},
		html5 : !!window.history && !!window.history.pushState,
		providers : providers
	};
}

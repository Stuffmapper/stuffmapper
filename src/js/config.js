stuffMapp.config(function($locationProvider, $stateProvider, $urlRouterProvider, $logProvider, UIRouterMetatagsProvider) {
	/*if(config.ionic.isIonic || config.electron.isElectron) $urlRouterProvider.otherwise('/login-steps');*/
	/*else*/

	UIRouterMetatagsProvider
		.setDefaultTitle('Stuffmapper')
		.setDefaultDescription('Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!')
		.setDefaultKeywords('stuffmapper, free stuff, give stuff, reusable stuff, get stuff')
		.setStaticProperties({
			'og:title': 'Stuffmapper',
			'og:description': 'Map stuff to give it! Dibs Stuff to get it! Get it done fast! Let\'s save millions of items from landfills everywhere and support and grow the free reusable stuff movement!',
			'og:image': 'https://www.stuffmapper.com/img/stuffmapper-logo.png',
			'og:url': 'https://www.stuffmapper.com',
			'og:type': 'website'
		})
		.setOGURL(true);

	$logProvider.debugEnabled(false);
	$locationProvider.html5Mode(true).hashPrefix('');
	$urlRouterProvider.otherwise(function ($injector, $location) {
		var $state = $injector.get('$state');
		$state.go('stuff.get');
	});

    $stateProvider
	.state('stuff', config.providers.stuff)
	.state('stuff.get', config.providers.getStuff)
	.state('stuff.get.item', config.providers.getItem)
	.state('stuff.give', config.providers.giveStuff)
	.state('stuff.my', config.providers.my)
	.state('stuff.my.items', config.providers.myStuff)
	.state('stuff.my.items.item', config.providers.myItem)
	.state('stuff.my.items.item.conversation', config.providers.myConversation)
	.state('stuff.my.watchlist', config.providers.myWatchlist)
	.state('stuff.my.settings', config.providers.mySettings)
	.state('privacy', config.providers.privacy)
	.state('useragreement', config.providers.useragreement)
	.state('faq', config.providers.faq)
	.state('about', config.providers.about);
/*	if(config.ionic.isIonic) {
		$stateProvider
		.state('login', config.providers.loginSteps)
		.state('setup1', config.providers.loginSetupOne)
		.state('setup2', config.providers.loginSetupTwo)
		.state('login-page', config.providers.loginPage);
	}*/
}).run(['$rootScope', 'MetaTags', function ($rootScope, MetaTags) {
	$rootScope.MetaTags = MetaTags;
}]);
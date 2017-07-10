stuffMapp.config(function($locationProvider, $stateProvider, $urlRouterProvider) {
	/*if(config.ionic.isIonic || config.electron.isElectron) $urlRouterProvider.otherwise('/login-steps');*/
	/*else*/

	/*$locationProvider.html5Mode(config.html5);*/
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/stuff/get');
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
});

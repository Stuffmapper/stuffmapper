stuffMapp.config(function($locationProvider, $stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise(config.ionic.isIonic?'/login/setup1':'/stuff/get');
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
	.state('stuff.my.conversation', config.providers.myConversation)
	.state('stuff.my.watchlist', config.providers.myWatchlist)
	.state('stuff.my.settings', config.providers.mySettings)
	.state('privacy', config.providers.privacy)
	.state('useragreement', config.providers.useragreement)
	.state('faq', config.providers.faq)
	.state('about', config.providers.about);
	if(config.ionic.isIonic) {
		$stateProvider
		.state('login', config.providers.loginMain)
		.state('login.step1', config.providers.loginOne)
		.state('login.step2', config.providers.loginTwo)
		.state('login.step3', config.providers.loginThree)
		.state('login.step4', config.providers.loginFour)
		.state('login.setup1', config.providers.setupOne)
		.state('login.setup2', config.providers.setupTwo);
	}
});

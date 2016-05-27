function MyController($scope, $state, $location, authenticated) {
	if(!authenticated.res.loggedIn) {
		$location.path('/stuff/get');
		return;
	}
	if($location.$$path === '/stuff/my') {
		$state.go('stuff.my.items');
		return;
	}
}

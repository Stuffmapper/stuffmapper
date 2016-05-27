function WatchListController($scope, $location, authentication) {
	if(!authenticated.res.loggedIn) {
		$location.path('stuff/get');
		return;
	}

	$scope.submitTagName = function() {

	};
}

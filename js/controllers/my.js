stuffMapp.controller('myController', ['$scope', '$state', '$location', 'authenticated', MyController]);
function MyController() {
	var $scope = arguments[0];
	var $state = arguments[1];
	var $location = arguments[2];
	// var authenticated = arguments[3];
	// console.log('authenticated:', authenticated);
	// if(authenticated.err || (authenticated.res && !authenticated.res.verified)) return $location.path('/stuff/get');
	if($location.$$path === '/stuff/my') {
		$state.go('stuff.my.items');
		return;
	}
}

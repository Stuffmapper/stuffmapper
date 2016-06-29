stuffMapp.controller('myController', ['$scope', '$state', '$location', 'authenticated', MyController]);
function MyController() {
	var $scope = arguments[0];
	var $state = arguments[1];
	var $location = arguments[2];
	var authenticated = arguments[3];
	if(authenticated.err) {
		$location.path('/stuff/get');
		return;
	}
	if($location.$$path === '/stuff/my') {
		$state.go('stuff.my.items');
		return;
	}
}

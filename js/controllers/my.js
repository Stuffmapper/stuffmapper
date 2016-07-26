stuffMapp.controller('myController', ['$scope', '$state', '$location', 'authenticator', MyController]);
function MyController() {
	var $scope = arguments[0];
	var $state = arguments[1];
	var $location = arguments[2];
	var authenticator = arguments[3];
	authenticator.then(function(data) {
		if(!data.res.user) {
			$state.go('stuff.get');
			window.location.hash = '#signin';
		} else {
			if($location.$$path === '/stuff/my') {
				$state.go('stuff.my.items');
				return;
			}
		}
	});
}

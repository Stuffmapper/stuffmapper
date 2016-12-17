stuffMapp.controller('myController', ['$scope', '$state', '$location', MyController]);
function MyController() {
	var $scope = arguments[0];
	var $state = arguments[1];
	var $location = arguments[2];
	// var authenticator = arguments[3];
	// var $http = arguments[4];
	// $http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(data){
	// 	if(!data.res.user) {
	// 		$state.go('stuff.get', {'#':'signin'});
	// 	} else {
	// 		if($location.$$path === '/stuff/my') {
	// 			$state.go('stuff.my.items');
	// 			return;
	// 		}
	// 	}
	// });
	if($location.$$path === '/stuff/my') {
		$state.go('stuff.my.items');
		return;
	}
}

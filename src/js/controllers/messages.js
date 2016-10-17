stuffMapp.controller('messagesController', ['$scope', '$http', '$state', 'authenticator', MessagesController]);
function MessagesController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $state = arguments[2];
	var authenticator = arguments[3];
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(data){
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.showModal();
		} else {
			$http.get(config.api.host + '/api/v' + config.api.version + '/messages').success(function(data) {
				$scope.messages = data.res;
				// console.log(data.res);
			});
			$scope.$on('$destroy', function() {
			});
		}
	});
}

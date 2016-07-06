stuffMapp.controller('messagesController', ['$scope', '$http', '$state', MessagesController]);
function MessagesController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	if((authenticated.res && !authenticated.res.user) || authenticated.err) return $state.go('stuff.get');
	$http.get(config.api.host + '/api/v' + config.api.version + '/messages').success(function(data) {
		$scope.messages = data.res;
		console.log(data.res);
	});
	$scope.$on('$destroy', function() {
	});
}

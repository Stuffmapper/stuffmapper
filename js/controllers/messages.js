stuffMapp.controller('messagesController', ['$scope', '$http', MessagesController]);
function MessagesController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	$http.get(config.api.host + 'api/' + config.api.version + '/messages').success(function(data) {
		$scope.messages = data.res;
	});
	$scope.$on('$destroy', function() {
	});
}

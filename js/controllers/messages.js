function MessagesController($scope, $http) {
		$http.get(config.api.host + 'api/' + config.api.version + '/messages').success(function(data) {
			$scope.messages = data.res;
			console.log(data);

		});
    $scope.$on('$destroy', function() {
    });
}

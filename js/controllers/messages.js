function MessagesController($scope, $http) {
		$http.get('/api/v1/messages').success(function(data) {
			$scope.messages = data.res;
			
		});
    $scope.$on('$destroy', function() {
    });
}

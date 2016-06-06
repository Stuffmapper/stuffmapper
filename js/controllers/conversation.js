function ConversationController($scope, $http, $stateParams) {
		$http.get('/api/v1/conversation/'+$stateParams.conversation).success(function(data) {
			$scope.messages = data.res;
			console.log(data);

			$scope.sendMessage = function() {
				$http.post('/api/v1/messages', {
					conversation_id:$stateParams.conversation,
					message:'Howdy!'
				}, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					transformRequest: function(data){
						return $.param(data);
					}
				}).success(function(data) {
					console.log(data);
				});
			};
		});
    $scope.$on('$destroy', function() {
    });
}

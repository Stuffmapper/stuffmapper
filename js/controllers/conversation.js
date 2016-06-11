function ConversationController($scope, $http, $stateParams) {
		$http.get(config.api.host + 'api/v1/conversation/'+$stateParams.conversation).success(function(data) {
			$scope.conversation = data.res;
			console.log(data.res);

			console.log($scope.socket);
			$scope.sendMessage = function() {
				console.log($('#cnversation-input').val());
				$http.post('/api/v1/messages', {
					conversation_id:$stateParams.conversation,
					message:$('#cnversation-input').val()
				}, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					transformRequest: function(data){
						return $.param(data);
					}
				}).success(function(data) {
					$('#conversation-messages').append([
						'<li class="conversation-message conversation-out-message" ng-repeat="message in conversation | reverse">',
						'	'+$('#cnversation-input').val(),
						'</li>'
					].join('\n'));
					$('#cnversation-input').val('')
				});
			};
		});
    $scope.$on('$destroy', function() {
    });
}

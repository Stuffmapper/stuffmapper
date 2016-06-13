stuffMapp.controller('conversationController', ['$scope', '$http', '$stateParams', ConversationController]);
function ConversationController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $stateParams = arguments[2];
	$http.get(config.api.host + 'api/v1/conversation/'+$stateParams.conversation).success(function(data) {
		$scope.conversation = data.res;
		$scope.sendMessage = function() {
			$http.post('/api/v1/messages', {
				conversation_id:$stateParams.conversation,
				message:$('#conversation-input').val()
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
			});
		};
	});
	$scope.$on('$destroy', function() {
	});
}

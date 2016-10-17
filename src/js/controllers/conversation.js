stuffMapp.controller('conversationController', ['$scope', '$http', '$stateParams', '$state', 'authenticator', ConversationController]);
function ConversationController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $stateParams = arguments[2];
	var $state = arguments[3];
	var authenticator = arguments[4];
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(data){
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.showModal();
		} else {
			$http.get(config.api.host + '/api/v'+config.api.version+'/conversation/'+$stateParams.conversation).success(function(data) {
				$scope.conversation = data.res.conversation;

				$scope.info = data.res.info;
				requestAnimationFrame(function() {
					out.scrollTop = out.scrollHeight - out.clientHeight;
					var len = $('li.conversation-message-container').length;
					if(!len) {
						$('#conversation-messages').append('<div class="conversation-message conversation-initial-message sm-full-width">Message the lister within 15 minutes to keep your Dibs!</div>');
					}
				});
				$scope.sendMessage = function() {
					if(!$('#conversation-input').val()) return;
					$http.post(config.api.host + '/api/v'+config.api.version+'/messages', {
						conversation_id:(parseInt($stateParams.conversation)),
						message:$('#conversation-input').val()
					}, {
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
						},
						transformRequest: function(data){
							return $.param(data);
						}
					}).success(function(data) {
						// console.log($scope.socket);
						$scope.socket.emit('message', {
							to: $scope.info.inboundMessenger,
							from: $scope.info.outboundMessenger,
							conversation: $stateParams.conversation,
							message: $('#conversation-input').val()
						});
						$scope.insertMessage('out', $('#conversation-input').val());
						$('#conversation-input').val('');
						$('#conversation-input').focus();
						var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
						$('#conversation-input')[0].style.height = 'auto';
						$('#conversation-input')[0].style.height = ($('#conversation-input')[0].scrollHeight) + 'px';
						$('#conversation-messages-container').css({'height':'calc(100% - '+($('#conversation-input')[0].scrollHeight+10)+'px)'});
						$('#conversation-input-container').height($('#conversation-input')[0].scrollHeight-2);
						if(isScrolledToBottom) {
							out.scrollTop = out.scrollHeight - out.clientHeight;
						}
					});
				};
			});
			var out = document.getElementById('conversation-messages');
			$scope.insertMessage = function(type, message) {
				var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
				$('#conversation-messages').append([
					'<li class="conversation-message-container" ng-repeat="message in conversation | reverse"><div class="conversation-message conversation-'+type+'-message">',
					message.trim(),
					'</div></li>'
				].join(''));
				if(isScrolledToBottom) {
					$(out).animate({
						scrollTop: out.scrollHeight - out.clientHeight
					}, 250);
				}
			};
			$('#conversation-input').on('input', function(e) {
				var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
				this.style.height = 'auto';
				this.style.height = (this.scrollHeight) + 'px';
				$('#conversation-messages-container').css({'height':'calc(100% - '+(this.scrollHeight+10)+'px)'});
				$('#conversation-input-container').height(this.scrollHeight-2);
				if(isScrolledToBottom) {
					out.scrollTop = out.scrollHeight - out.clientHeight;
				}
			});
			$scope.$on('$destroy', function() {

			});
		}
	});
}

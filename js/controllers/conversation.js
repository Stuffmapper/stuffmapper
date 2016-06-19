stuffMapp.controller('conversationController', ['$scope', '$http', '$stateParams', ConversationController]);
function ConversationController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $stateParams = arguments[2];
	$http.get(config.api.host + 'api/v1/conversation/'+$stateParams.conversation).success(function(data) {
		$scope.conversation = data.res;
		requestAnimationFrame(function() {
			out.scrollTop = out.scrollHeight - out.clientHeight;
		});
		$scope.sendMessage = function() {
			if(!$('#conversation-input').val()) return;
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
				insertMessage('out', $('#conversation-input').val());
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
	function insertMessage(type, message) {
		var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
		$('#conversation-messages').append([
			'<li class="conversation-message-container" ng-repeat="message in conversation | reverse"><div class="conversation-message conversation-'+type+'-message">',
			message,
			'</div></li>'
		].join(''));
		if(isScrolledToBottom) {
			$(out).animate({
				scrollTop: out.scrollHeight - out.clientHeight
			}, 250);
		}
	}
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
	$('#conversation-input').on('keydown', function(e){
		if(e.which === 13) {
			$scope.sendMessage();
			e.preventDefault();
		}
	});
	$scope.$on('$destroy', function() {

	});
}

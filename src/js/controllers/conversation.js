stuffMapp.controller('conversationController', ['$scope', '$http', '$stateParams', '$state', 'authenticator', '$stuffTabs', ConversationController]);
function ConversationController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $stateParams = arguments[2];
	var $state = arguments[3];
	var authenticator = arguments[4];
	var $stuffTabs = arguments[5];
	function backToEditItem(id) {
		$state.go('stuff.my.items.item', {id: id});
	}
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(data){
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.openModal('modal');
		}
		else {
			var conversationPostId = parseInt(window.location.pathname.split('items/')[1].split('/messages')[0]);
			$('#conversation-animation-container').css({'pointer-events': 'all'});
			$stuffTabs.init($scope, '#tab-container .stuff-tabs .my-stuff-tab a');
			$http.get(config.api.host + '/api/v'+config.api.version+'/conversation/'+conversationPostId).success(function(data) {
				$scope.conversation = data.res.conversation;
				$scope.conversationInfo = data.res.info;
				$scope.info = data.res.info;
				requestAnimationFrame(function() {
					out.scrollTop = out.scrollHeight - out.clientHeight;
					var len = $('li.conversation-message-container').length;
					console.log('CONVERSATION LENGTH:', len);
					if(len === 1 && data.res.info.type === 'dibber') {
						$('#conversation-messages').append('<div class="conversation-message conversation-initial-message sm-full-width">Message the lister within 15 minutes to keep your Dibs!</div>');
					}
				});
				$('#conversation-title').text(data.res.info.title);
				$('#back-to-edit-my-item').on('click', function() {
					backToEditItem(conversationPostId);
				});
				$('#conversation-messages').prepend('<li class="conversation-message-container conversation-message-container-in"><div class="user-icon-message-stuffmapper"></div><div class="conversation-message conversation-in-message"><img src="https://cdn.stuffmapper.com'+$scope.conversationInfo.image+'" /><div>'+$scope.conversationInfo.description+'</div></div></li>');
				requestAnimationFrame(function() {
					$('#conversation-input').val('');
					$('#conversation-input').focus();
					calcTextArea();
				});
				$scope.sendMessage = function() {
					if(!$('#conversation-input').val().trim()) return;
					$.post(config.api.host + '/api/v'+config.api.version+'/messages', {
						conversation_id:(parseInt($scope.info.id)),
						message:$('#conversation-input').val()
					}, function(data) {
						$scope.socket.emit('message', {
							to: $scope.info.inboundMessenger,
							from: $scope.info.outboundMessenger,
							conversation: conversationPostId,
							message: $('#conversation-input').val()
						});
						$scope.insertMessage('out', $('#conversation-input').val());
						$('#conversation-input').val('');
						$('#conversation-input').focus();
						calcTextArea();
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
			$('#conversation-input textarea').on('keypress', calcTextArea);
			$scope.$on('$destroy', function() {
				$('#conversation-animation-container').css({'pointer-events': 'none'});
				$('#back-to-edit-my-item').off('click', backToEditItem);
			});
		}
		function calcTextArea(e) {
			if(e && e.keyCode === 13) return e.preventDefault();
			var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
			$('#conversation-input textarea')[0].style.height = 'auto';
			$('#conversation-input textarea')[0].style.height = ($('#conversation-input textarea')[0].scrollHeight) + 'px';
			$('#conversation-messages-container').css({'height':'calc(100% - '+($('#conversation-input textarea')[0].scrollHeight+10)+'px)'});
			$('#conversation-input-container').height($('#conversation-input textarea')[0].scrollHeight+10);
			$('#conversation-input').height($('#conversation-input textarea')[0].scrollHeight+1);
			if(isScrolledToBottom) out.scrollTop = out.scrollHeight - out.clientHeight;
		}
	});
}

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
				$([
					'<div id="dropdown-menu2" class="popups popups-top-right animate-250 hidden-popup">',
					($scope.info.attended && $scope.info.dibbed)?'<li id="get-single-item-conversation-popup'+$scope.info.id+'">Go to conversation</li>':'',
					($scope.info.type==='lister' || ($scope.info.type==='dibber' && !$scope.info.attended))?'<li id="my-item-complete'+$scope.info.id+'">Mark as picked up</li>':'',
					($scope.info.type==='lister' && $scope.info.dibbed)?'	<li id="my-item-reject'+$scope.info.id+'">Reject Dibs</li>':'',
					($scope.info.type==='dibber' && $scope.info.dibbed)?'	<li id="my-item-undibs'+$scope.info.id+'">unDibs</li>':'',
					($scope.info.type==='lister' && !$scope.info.dibbed)?'	<li id="get-single-item-edit-dibs-button'+$scope.info.id+'">Edit item</li>':'',
					'</div>'
				].join('\n')).appendTo('#conversation-messages-container');
				$('#my-item-menu-conversation').on('click', openMenu2);
				$scope.sendMessage = function() {
					if(!$('#conversation-input').val().trim()) return;
					$.post(config.api.host + '/api/v'+config.api.version+'/messages', {
						conversation_id:(parseInt($scope.info.id)),
						message:$('#conversation-input').val()
					}, function(data) {
						if(!$scope.socket) {
							$scope.socket = io('https://'+subdomain+'.stuffmapper.com');
							$scope.socket.on((data.res.user.id), function(data) {
								// SMAlert.set(data.messages.message, 5000, function() {
								// 	console.log('clicked!');
								// });
								var lPath = $location.$$path.split('/');
								lPath.shift();
								var out = document.getElementById('conversation-messages');
								if(out && lPath[0] === 'stuff' && lPath[1] === 'my' && lPath[2] === 'items' && parseInt(lPath[3]) === parseInt(data.messages.conversation) && lPath[4] === 'messages' && lPath.length === 5) {
									var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
									$('#conversation-messages').append([
										'<li class="conversation-message-container" ng-repeat="message in conversation | reverse"><div class="fa fa-user user-icon-message"></div><div class="conversation-message conversation-in-message">',
										''+data.messages.message,
										'</div></li>'
									].join(''));
									if(isScrolledToBottom) {
										$(out).animate({
											scrollTop: out.scrollHeight - out.clientHeight
										}, 250);
									}
								}
							});
						}
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
function openMenu2() {
	$('#dropdown-menu2').removeClass('hidden-popup');
	requestAnimationFrame(function() {
		$('body').one('click', function() {
			$('#dropdown-menu2').addClass('hidden-popup');
		});
	});
}

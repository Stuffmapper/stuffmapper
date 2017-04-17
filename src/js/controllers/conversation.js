stuffMapp.controller('conversationController', ['$scope', '$http', '$stateParams', '$state', 'authenticator', '$stuffTabs', ConversationController]);
function ConversationController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $stateParams = arguments[2];
	var $state = arguments[3];
	var authenticator = arguments[4];
	// var $stuffTabs = arguments[5];
	var firstMessage = false;
	$('#my-stuff-container').addClass('in-conversation');
	function backToEditItem(id) {
		$state.go('stuff.my.items.item', {id: id});
	}
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(data){
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.openModal('modal');
		}
		else {
			if(($scope.socket && !$scope.socket.connected) || !$scope.socket) resetSockets($scope, $state, data);
			var conversationPostId = parseInt(window.location.pathname.split('items/')[1].split('/messages')[0]);
			$('#conversation-animation-container').css({'pointer-events': 'all'});
			// $stuffTabs.init($scope, '#tab-container .stuff-tabs .my-stuff-tab a');
			$http.get(config.api.host + '/api/v'+config.api.version+'/conversation/'+conversationPostId).success(function(data) {
				$.post(config.api.host + '/api/v'+config.api.version+'/conversation/read/'+conversationPostId, function(data) {
					$('#tab-message-badge').html(data.res);
				});
				$scope.conversation = data.res.conversation;
				$scope.conversationInfo = data.res.info;
				console.log($scope.conversationInfo);
				$scope.info = data.res.info;
				$scope.conversation.forEach(function(e,i) {
					$scope.conversation[i].date_created = dateFormat(new Date(e.date_created), 'h:MMtt – dd mmm yyyy');
				});
				requestAnimationFrame(function() {
					requestAnimationFrame(function() {
						if($scope.conversationInfo.type === 'dibber') {
							var foundFirstOut = false;
							$('#conversation-messages').children().each(function(i,e) {
								if(!foundFirstOut && $(e).hasClass('conversation-message-container-out')) {
									foundFirstOut = true;
									$('<li class="conversation-message-container conversation-message-container-in"><div class="user-icon-message-stuffmapper"></div><div class="conversation-message conversation-in-message conversation-stuffmapper-message"><div>Dibs secured! Thanks for initiating communication. We\'ll notify you via email of any new messages sent from lister while you\'re offline. Enjoy your new stuff!</div></div></li>').insertAfter(e);
								}
							});
						}
						requestAnimationFrame(function() {
							requestAnimationFrame(function() {
								out.scrollTop = out.scrollHeight - out.clientHeight;
								var len = $('li.conversation-message-container').length;
								if(len === 1 && data.res.info.type === 'dibber') {
									firstMessage = true;
									$('#conversation-messages').append('<div class="conversation-message conversation-initial-message sm-full-width">Message the lister within 15 minutes to keep your Dibs!</div>');
								}
							});
						});
					});
				});
				$('#conversation-title').text(data.res.info.title);
				if(data.res.info.type === 'lister') $('#conversation-messages').prepend('<li class="conversation-message-container conversation-message-container-in"><div class="user-icon-message-stuffmapper"></div><div class="conversation-message conversation-in-message conversation-stuffmapper-message"><div><em>'+data.res.info.users[data.res.info.dibber_id]+'</em> Dibs\'d your <em>'+data.res.info.title+'</em>. They must send you a message within 15 minutes to keep their Dibs.</div></div></li>');
				if(data.res.info.type === 'dibber') {
					firstMessage = true;
					$('#conversation-messages').prepend('<li class="conversation-message-container conversation-message-container-in"><div class="user-icon-message-stuffmapper"></div><div class="conversation-message conversation-in-message conversation-stuffmapper-message"><div>You Dibs\'d <em>'+data.res.info.title+'</em> – Message the lister within 15 minutes to keep your Dibs!</div></div></li>');
				}
				$('#conversation-messages').prepend('<li class="conversation-message-container conversation-message-container-in"><div class="user-icon-message-stuffmapper"></div><div class="conversation-message conversation-in-message conversation-stuffmapper-message"><img src="https://cdn.stuffmapper.com'+$scope.conversationInfo.image+'" /><strong>'+$scope.conversationInfo.title+'</strong><div>'+$scope.conversationInfo.description+'</div></div></li>');
				requestAnimationFrame(function() {
					$('#conversation-input').val('');
					$('#conversation-input').focus();
					calcTextArea();
				});
				$([
					'<div id="dropdown-menu2" class="popups popups-top-right animate-250 hidden-popup">',
					'<li id="back-to-edit-my-item2">Go to item</li>',
					($scope.info.type==='lister' || ($scope.info.type==='dibber' && !$scope.info.attended))?'<li id="conversation-complete'+$scope.info.post_id+'">Mark as picked up</li>':'',
					($scope.info.type==='lister')?'	<li id="conversation-reject'+$scope.info.post_id+'">Reject Dibs</li>':'',
					($scope.info.type==='dibber')?'	<li id="conversation-undibs'+$scope.info.post_id+'">unDibs</li>':'',
					'</div>'
				].join('\n')).appendTo('#conversation-messages-container');


				function openUndibsModal2() {
					var undibsBodyTemplate = $scope.listItem.attended?'Are you sure you want to unDibs <i>{{title}}</i>?  You will not be refunded and the stuff will be relisted.':'Are you sure you want to unDibs <i>{{title}}</i>?  You will lose your Dibs and the stuff will be relisted.';;
					$('#undibs-confirm-modal-body').html(undibsBodyTemplate.replace('{{title}}', data.res.info.title));
					$('#my-item-undibs-cancel').on('click', undibsCancel2);
					$('#my-item-undibs-confirm').on('click', undibsConfirm2);
					$u.modal.open('undibs-confirm-modal', function() {
						$('#my-item-undibs-cancel').off('click', undibsCancel2);
						$('#my-item-undibs-confirm').off('click', undibsConfirm2);
					});
				}
				function undibsCancel2() {
					$u.modal.close('undibs-confirm-modal');
				}
				function undibsConfirm2() {
					$u.modal.close('undibs-confirm-modal');
					$u.api.undibsStuffById(data.res.info.post_id, function() {
						$state.go('stuff.my.items');
						$('#post-item-'+data.res.info.post_id).parent().parent().remove();
						$u.toast('You have successfully unDibs\'d <i>'+data.res.info.title+'</i>');
						requestAnimationFrame(function(){$(window).resize();});
						setTimeout(function(){$state.reload('stuff.my.items');}, 250);
					});
				}
				function openRejectModal2() {
					var rejectBodyTemplate = 'Are you sure you want to reject <i>{{uname}}</i>\'s Dibs for your item <i>{{title}}</i>? This cannot be undone.'; //dibber uname
					$('#reject-confirm-modal-body').html(rejectBodyTemplate.replace('{{title}}', data.res.info.title).replace('{{uname}}', data.res.info.users[data.res.info.dibber_id]));
					$('#my-item-reject-cancel').on('click', rejectCancel2);
					$('#my-item-reject-confirm').on('click', rejectConfirm2);
					$u.modal.open('reject-confirm-modal', function() {
						$('#my-item-reject-cancel').off('click', rejectCancel2);
						$('#my-item-reject-confirm').off('click', rejectConfirm2);
					});
				}
				function rejectCancel2() {
					$u.modal.close('reject-confirm-modal');
				}
				function rejectConfirm2() {
					$u.modal.close('reject-confirm-modal');
					$u.api.rejectStuffById(data.res.info.post_id, function() {
						$state.go('stuff.my.items');
						$u.toast('You have rejected <i>'+data.res.info.user[data.res.info.dibber_id]+'</i>\'s Dibs for <i>'+data.res.info.title+'</i>');
						setTimeout(function(){$state.reload('stuff.my.items');}, 250);
					});
				}
				function openDeleteModal2() {
					var deleteBodyTemplate = 'Are you sure you want to delete your item <i>{{title}}</i>? This cannot be undone.';
					$('#delete-confirm-modal-body').html(deleteBodyTemplate.replace('{{title}}', data.res.info.title));
					$('#my-item-delete-cancel').on('click', deleteCancel2);
					$('#my-item-delete-confirm').on('click', deleteConfirm2);
					$u.modal.open('delete-confirm-modal', function() {
						$('#my-item-delete-cancel').off('click', deleteCancel2);
						$('#my-item-delete-confirm').off('click', deleteConfirm2);
					});
				}
				function deleteCancel2() {
					$u.modal.close('delete-confirm-modal');
				}
				function deleteConfirm2() {
					$u.modal.close('delete-confirm-modal');
					$u.api.deleteStuffById(data.res.info.post_id, function() {
						$state.go('stuff.my.items');
						$('#post-item-'+data.res.info.post_id).parent().parent().remove();
						$u.toast('Your listing has been removed.');
						requestAnimationFrame(function(){$(window).resize();});
						setTimeout(function(){$state.reload('stuff.my.items');}, 250);
					});
				}
				function openCompleteModal2() {
					var completeBodyTemplate = 'Has <i>{{title}}</i> been picked up?';
					$('#complete-confirm-modal-body').html(completeBodyTemplate.replace('{{title}}', data.res.info.title.trim()).replace('{{title}}', data.res.info.users[data.res.info.lister_id]));
					$('#my-item-complete-cancel').on('click', completeCancel2);
					$('#my-item-complete-confirm').on('click', completeConfirm2);
					$u.modal.open('complete-confirm-modal', function() {
						$('#my-item-complete-cancel').off('click', completeCancel2);
						$('#my-item-complete-confirm').off('click', completeConfirm2);
					});
				}
				function completeCancel2() {
					$u.modal.close('complete-confirm-modal');
				}
				function completeConfirm2() {
					$u.modal.close('complete-confirm-modal');
					$u.api.completeStuffById(data.res.info.post_id, function() {
						$('#post-item-'+data.res.info.post_id).parent().parent().remove();
						$u.toast('Dibs for <i>'+data.res.info.title+'</i> has been completed!');
						requestAnimationFrame(function(){$(window).resize();});
						$state.go('stuff.my.items');
						setTimeout(function(){$state.reload('stuff.my.items');}, 250);
					});
				}

				requestAnimationFrame(function() {
					requestAnimationFrame(function() {
						$('#back-to-edit-my-item, #back-to-edit-my-item2, #conversation-title').on('click', function() {
							backToEditItem(conversationPostId);
						});
						$('#conversation-undibs'+$scope.info.post_id).on('click', openUndibsModal2);
						$('#conversation-reject'+$scope.info.post_id).on('click', openRejectModal2);
						$('#conversation-delete'+$scope.info.post_id).on('click', openDeleteModal2);
						$('#conversation-complete'+$scope.info.post_id).on('click', openCompleteModal2);
						$('#my-item-menu-conversation').on('click', openMenu2);
					});
				});

				$scope.sendMessage = function() {
					if(!$('#conversation-input').val().trim()) return;
					$.post(config.api.host + '/api/v'+config.api.version+'/messages', {
						conversation_id:(parseInt($scope.info.id)),
						message:$('#conversation-input').val()
					}, function() {
						$scope.socket.emit('message', {
							to: $scope.info.inboundMessenger,
							from: $scope.info.outboundMessenger,
							conversation: conversationPostId,
							message: $('#conversation-input').val(),
							title: data.res.info.title
						});
						$scope.insertMessage('out', $('#conversation-input').val());
						$('#conversation-input').val('');
						$('#conversation-input').focus();
						if(firstMessage) {
							$('#conversation-messages').append('<li class="conversation-message-container conversation-message-container-in"><div class="user-icon-message-stuffmapper"></div><div class="conversation-message conversation-in-message conversation-stuffmapper-message"><div>Dibs secured! Thanks for initiating communication. We\'ll notify you via email of any new messages sent from lister while you\'re offline. Enjoy your new stuff!</div></div></li>');
							firstMessage = false;
						}
						calcTextArea();
					});
				};
				$('#conversation-input div textarea').on('focus', function(e) {
					$('html, body').animate({ scrollTop: $(document).height() }, 250);
					$('#conversation-messages').animate({ scrollTop: $(document).height() }, 250);
					console.log('focus');
				});
				$scope.$on('$destroy', function() {
					$('#conversation-input').off('focus');
					$('#my-stuff-container').removeClass('in-conversation');
					$('#conversation-undibs'+$scope.info.post_id).off('click', openUndibsModal2);
					$('#conversation-reject'+$scope.info.post_id).off('click', openRejectModal2);
					$('#conversation-delete'+$scope.info.post_id).off('click', openDeleteModal2);
					$('#conversation-complete'+$scope.info.post_id).off('click', openCompleteModal2);
					$('#my-item-menu-conversation').off('click', openMenu2);
					$('#conversation-animation-container').css({'pointer-events': 'none'});
					$('#back-to-edit-my-item').off('click', backToEditItem);
				});
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
			$('#conversation-input textarea').on('keyup', calcTextArea);

		}
		function calcTextArea(e) {
			if(e && e.keyCode === 13) return e.preventDefault();
			var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
			$('#conversation-input textarea')[0].style.height = 'auto';
			$('#conversation-input textarea')[0].style.height = (parseInt(($('#conversation-input textarea')[0].scrollHeight))+10) + 'px';
			$('#conversation-messages-container').css({'height':'calc(100% - '+(parseInt(($('#conversation-input textarea')[0].scrollHeight+20)))+'px)'});
			$('#conversation-input-container').height(parseInt($('#conversation-input textarea')[0].scrollHeight)+30);
			$('#conversation-input').height(parseInt($('#conversation-input textarea')[0].scrollHeight)+1);
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

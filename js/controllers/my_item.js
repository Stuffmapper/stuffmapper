stuffMapp.controller('myItemsController', ['$scope', '$http', 'authenticator', '$stateParams', '$userData', '$state', MyItemsController]);
function MyItemsController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var authenticator = arguments[2];
	var $stateParams = arguments[3];
	var $userData = arguments[4];
	var $state = arguments[5];
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(data){
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.showModal();
		} else {
			$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/my/id/' + $stateParams.id).success(function(data) {
				if(!data.err) {
					$scope.listItem = data.res;
					/* jshint ignore:start */
					function getWordsBetweenCurlies(str) {
						var results = [], re = /{{([^}]+)}}/g, text;
						while(text = re.exec(str)) {
							results.push(text[1]);
						}
						return results;
					}
					/* jshint ignore:end */
					$scope.googleMapStaticUrl = [
						'https://maps.googleapis.com/maps/api/staticmap?',
						'zoom=13&size=600x300&maptype=roadmap&',
						'markers=color:red%7C{lat},{lng}&',
						'key=AIzaSyC9wZTqNMPxl86PtJuR4Dq3TzS_hByOs3U'
					].join('');
					$scope.imgScale = 1;
					var aspectRatio = (($('#my-item-single-container-'+$stateParams.id).width()/$('#my-item-single-container-'+$stateParams.id).height())>(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').height())));
					$scope.imgScale = ($('#post-item-' + $stateParams.id + ' img').height())/($('#masonry-container').height()*0.4);
					$scope.container = $('<div>', {id:'get-item-single-'+$stateParams.id, class:'my-item-single-container animate-250'});
					$scope.imageContainer = $('<div>', {class:'get-item-single-image-container animate-250'});
					$scope.detailsContainer = $('<div>', {class:'get-item-single-details-container sm-hidden animate-250'});
					$scope.containerBackground = $('<div>', {class:'get-item-single-background animate-250 sm-hidden'});
					$scope.imageContainer.css({
						'transform' : 'translate3d(' + ($('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left)+'px, '+($('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top) + 'px, ' + '0)'
					});
					$scope.detailsContainer.html([
						'<div class="sm-text-m sm-full-width">'+data.res.title+'</div>',
						// '<button id="get-single-item-edit-dibs-button'+$stateParams.id+'" class="sm-button sm-text-l sm-button-default sm-button-full-width">Edit</button>',
						($scope.listItem.attended && $scope.listItem.dibbed)?'<button id="get-single-item-conversation-button'+$stateParams.id+'" class="sm-button sm-text-l sm-button-default sm-button-full-width">Go to Conversation</button>':'',
						($scope.listItem.type==='lister' && !$scope.listItem.dibbed)?'<button id="get-single-item-archive-button'+$stateParams.id+'" class="sm-button sm-button-ghost sm-text-l sm-button-negative sm-button-full-width animate-250">Archive</button>':(($scope.listItem.type==='dibber')?'<button id="get-single-item-undibs-button'+$stateParams.id+'" class="sm-button sm-button-ghost sm-text-l sm-button-negative sm-button-full-width animate-250">unDibs</button>':'<button id="get-single-item-reject-button'+$stateParams.id+'" class="sm-button sm-button-ghost sm-text-l sm-button-negative sm-button-full-width animate-250">Reject Dibber</button>'),
						(!$scope.listItem.dibbed?'<button id="get-single-item-edit-button'+$stateParams.id+'" class="sm-button sm-button-default sm-text-l sm-button-full-width animate-250">Edit Dibs!</button>':''),
						($scope.listItem.dibbed?'<button id="get-single-item-complete-button'+$stateParams.id+'" class="sm-button sm-button-positive sm-text-l sm-button-full-width animate-250">Complete Dibs!</button>':''),
						'<p class="sm-text-m sm-full-width">'+data.res.description+'</p>',
						((!$scope.listItem.attended)?'<div class="sm-text-s sm-full-width" style="margin-bottom:0px;text-align:center;">Click the map below to find your stuff!</div>':''),
						((!$scope.listItem.attended)?'<a href="https://maps.google.com/maps?q='+$scope.listItem.lat+','+$scope.listItem.lng+'" target="_blank"><img style="width: 100%;" src="'+$scope.googleMapStaticUrl.replace('{lat}', $scope.listItem.lat).replace('{lng}', $scope.listItem.lng)+'" /></a>':'<img style="width: 100%; padding-top: 10px;" src="'+$scope.googleMapStaticUrl.replace('{lat}', $scope.listItem.lat).replace('{lng}', $scope.listItem.lng)+'" />')
					].join('\n'));
					$scope.singleItem = $('#post-item-' + $stateParams.id + ' img')
					.clone()
					.attr('id', 'my-item-single-container-' + $stateParams.id)
					.addClass('animate-250')
					.css({
						'position': 'absolute',
						'top':'0px',
						'left':'0px',
						'transform': 'scale3d('+$scope.imgScale+', '+$scope.imgScale+', 1) translate3d(0px, 0px, 0)',
						'z-index': '2',
						'transform-origin': '0 0',
						'width': (($(this).width()/$(this).height())>(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').height()))?'100%':'auto'),
						'height': (($(this).width()/$(this).height())<=(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').height()))?'auto':'100%')
					});
					$scope.containerBackground.appendTo($scope.container);
					$scope.singleItem.appendTo($scope.imageContainer);
					$scope.imageContainer.appendTo($scope.container);
					$scope.detailsContainer.appendTo($scope.container);
					$scope.container.appendTo('#my-stuff-container');
					requestAnimationFrame(function() {
						requestAnimationFrame(function() {
							$('#post-item-'+$stateParams.id+' img').css({'opacity':0.0001});
							$scope.containerBackground.removeClass('sm-hidden');
							$scope.detailsContainer.removeClass('sm-hidden');
							$scope.imageContainer.css({
								'transform' : 'translate3d(0px, 0px, 0)'
							});
							$scope.singleItem.css({
								'z-index': '3',
								'transform': 'scale3d(1, 1, 1) translate3d('+($('#masonry-container').width()/2-$scope.singleItem.width()/2)+'px, 0px, 0)'
							});
							$('#get-item-single-'+$stateParams.id + ' .get-stuff-item-info').addClass('get-single-item-info').append([
								'<h3 class="sm-text-m sm-full-width sm-hidden animate-250">',
								'	'+$scope.listItem.description,
								'</h3>'
							].join('\n'));
							var $el = ($('#get-item-single'+$stateParams.id).append('<button class="get-single-item-dibs-button sm-hidden animate-250">Dibs!</button>'));
							requestAnimationFrame(function() {
								$('.get-single-item-description, .get-single-item-dibs-button').removeClass('sm-hidden');
								$('#get-stuff-back-button-container').removeClass('sm-hidden');
								$('#get-stuff-item-title').text($scope.listItem.title);
								setTimeout(function() {
									$('.get-stuff-back-button').removeClass('sm-hidden');
								},100);
								setTimeout(function() {
									$('#get-stuff-item-title').removeClass('sm-hidden');
								},300);
								checkScroll();
							});
						});
					});
					$('#get-single-item-undibs-button'+$scope.listItem.id).on('click', undibs);
					$('#get-single-item-archive-button'+$stateParams.id).on('click', archive);
					$('#get-single-item-reject-button'+$stateParams.id).on('click', reject);
					$('#get-single-item-conversation-button'+$scope.listItem.id).on('click', goToConversation);
				}
			});
			var checkScroll = function() {
				var div = $scope.detailsContainer[0];
				var hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
			};
			var goToConversation = function() {
				$state.go('stuff.my.conversation', {conversation:$scope.listItem.conversation_id});
			};
			var archive = function() {
				$http.delete(config.api.host + '/api/v' + config.api.version + '/stuff/id/' + $scope.listItem.id, {}, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					transformRequest: function(data) {
						return $.param(data);
					}
				}).success(function(data) {
					if(!data.err) {
						$('#post-item-'+$scope.listItem.id).parent().parent().remove();
						requestAnimationFrame(function(){
							$('.masonry-grid').isotope({
								columnWidth: $('.masonry-grid').width()/2,
								itemSelector: '.masonry-grid-item',
								getSortData: {
									number: '.number parseInt'
								},
								sortBy: 'number',
								isAnimated: true
							});
							setTimeout(function() {
								$state.go('stuff.my.items');
							}, 250);
						});
					}
				});
			};
			var reject = function() {
				$http.delete(config.api.host + '/api/v' + config.api.version + '/dibs/reject/' + $scope.listItem.id, {}, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					transformRequest: function(data) {
						return $.param(data);
					}
				}).success(function(data) {
					if(!data.err) {
						$('#post-item-'+$scope.listItem.id).parent().parent().remove();
						requestAnimationFrame(function(){
							$('.masonry-grid').isotope({
								columnWidth: $('.masonry-grid').width()/2,
								itemSelector: '.masonry-grid-item',
								getSortData: {
									number: '.number parseInt'
								},
								sortBy: 'number',
								isAnimated: true
							});
							setTimeout(function() {
								$state.go('stuff.my.items');
							}, 250);
						});
					}
				});
			};
			var undibs = function() {
				$http.post(config.api.host + '/api/v' + config.api.version + '/undib/' + $scope.listItem.id, {}, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					transformRequest: function(data) {
						return $.param(data);
					}
				}).success(function(data) {
					if(!data.err) {
						$('#post-item-'+$scope.listItem.id).parent().parent().remove();
						requestAnimationFrame(function(){
							$('.masonry-grid').isotope({
								columnWidth: $('.masonry-grid').width()/2,
								itemSelector: '.masonry-grid-item',
								getSortData: {
									number: '.number parseInt'
								},
								sortBy: 'number',
								isAnimated: true
							});
							setTimeout(function() {
								$state.go('stuff.my.items');
							}, 250);
						});
					}
				});
			};
			$scope.$on('$destroy', function() {
				$('#get-single-item-undibs-button'+$scope.listItem.id).off('click', undibs);
				$('#get-single-item-conversation-button'+$scope.listItem.id).off('click', goToConversation);
				$('#get-stuff-back-button-container').addClass('sm-hidden');
				$('.get-stuff-back-button').addClass('sm-hidden');
				$('#get-stuff-item-title').addClass('sm-hidden');
				//$('#get-single-item-dibs-button'+$stateParams.id).off('click', dibs);
				if($('#post-item-' + $stateParams.id).length) {
					$scope.imageContainer.css({
						'transform' : 'translate3d(' + ($('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left)+'px, '+($('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top) + 'px, ' + '0)'
					});
				} else {
					$scope.imageContainer.css({
						'transform' : 'translate3d(0px, -100%, 0)'
					});
				}
				$scope.containerBackground.addClass('sm-hidden');
				$scope.detailsContainer.addClass('sm-hidden');
				$scope.singleItem.css({
					'transform':'scale3d('+$scope.imgScale+', '+$scope.imgScale+', 1) translate3d(0px, 0px, 0)',
					'z-index': '2'
				});
				$('.get-single-item-description, .get-single-item-dibs-button').addClass('sm-hidden');
				setTimeout(function() {
					$('#post-item-'+$stateParams.id + ' img').css({'opacity': ''});
					requestAnimationFrame(function() {
						requestAnimationFrame(function() {
							$scope.container.remove();
						});
					});
				}, 250);
			});
		}
	});
}

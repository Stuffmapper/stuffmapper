stuffMapp.controller('myItemsController', ['$scope', '$http', 'authenticator', '$stateParams', '$userData', '$state', MyItemsController]);
function MyItemsController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var authenticator = arguments[2];
	var $stateParams = arguments[3];
	var $userData = arguments[4];
	var $state = arguments[5];
	authenticator.then(function(data) {
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
		} else {
			$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/id/' + $stateParams.id).success(function(data) {
				$scope.listItem = data.res;
				console.log('user id: ' + $userData.getUserId());
				/* jshint ignore:start */
				function getWordsBetweenCurlies(str) {
					var results = [], re = /{{([^}]+)}}/g, text;
					while(text = re.exec(str)) {
						results.push(text[1]);
					}
					return results;
				}
				/* jshint ignore:end */
				$scope.imgScale = 1;
				var aspectRatio = (($('#my-item-single-container-'+$stateParams.id).width()/$('#my-item-single-container-'+$stateParams.id).height())>(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').height())));
				$scope.imgScale = ($('#post-item-' + $stateParams.id + ' img').height())/($('#masonry-container').height()*0.4);
				$scope.container = $('<div>', {id:'get-item-single-'+$stateParams.id, class:'my-item-single-container animate-250'});
				$scope.imageContainer = $('<div>', {class:'get-item-single-image-container animate-250'});
				$scope.detailsContainer = $('<div>', {class:'get-item-single-details-container hidden animate-250'});
				$scope.containerBackground = $('<div>', {class:'get-item-single-background animate-250 hidden'});
				$scope.imageContainer.css({
					'transform' : 'translate3d(' + ($('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left)+'px, '+($('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top) + 'px, ' + '0)'
				});
				$scope.detailsContainer.html([
					'<div class="get-item-single-title">'+data.res.title+'</div>',
					'<a id="get-single-item-dibs-button'+$stateParams.id+'" class="get-item-single-dibs-button">Edit</a>',
					'<a id="get-single-item-dibs-button'+$stateParams.id+'" class="get-item-single-dibs-button">Go to Conversation</a>',
					'<a id="get-single-item-dibs-button'+$stateParams.id+'" class="get-item-single-dibs-button">Undibs</a>',
					'<p class="get-item-single-description">'+data.res.description+'</p>',
					'<div class="">',
					'	<div class="get-item-single-category"></div><div class="get-item-single-time"></div>',
					'</div>'
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
						$scope.containerBackground.removeClass('hidden');
						$scope.detailsContainer.removeClass('hidden');
						$scope.imageContainer.css({
							'transform' : 'translate3d(0px, 0px, 0)'
						});
						$scope.singleItem.css({
							'z-index': '3',
							'transform': 'scale3d(1, 1, 1) translate3d('+($('#masonry-container').width()/2-$scope.singleItem.width()/2)+'px, 0px, 0)'
						});
						$('#get-item-single-'+$stateParams.id + ' .get-stuff-item-info').addClass('get-single-item-info').append([
							'<h3 class="get-single-item-description hidden animate-250">',
							'	'+$scope.listItem.description,
							'</h3>'
						].join('\n'));
						var $el = ($('#get-item-single'+$stateParams.id).append('<button class="get-single-item-dibs-button hidden animate-250">Dibs!</button>'));
						requestAnimationFrame(function() {
							$('.get-single-item-description, .get-single-item-dibs-button').removeClass('hidden');
							$('#get-stuff-back-button-container').removeClass('hidden');
							$('#get-stuff-item-title').text($scope.listItem.title);
							setTimeout(function() {
								$('.get-stuff-back-button').removeClass('hidden');
							},100);
							setTimeout(function() {
								$('#get-stuff-item-title').removeClass('hidden');
							},300);
							checkScroll();
						});
					});
				});
			});
			function checkScroll() {
				var div = $scope.detailsContainer[0];
				var hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
			}
			$scope.$on('$destroy', function() {
				$('#get-stuff-back-button-container').addClass('hidden');
				$('.get-stuff-back-button').addClass('hidden');
				$('#get-stuff-item-title').addClass('hidden');
				//$('#get-single-item-dibs-button'+$stateParams.id).off('click', dibs);
				$scope.imageContainer.css({
					'transform' : 'translate3d(' + ($('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left)+'px, '+($('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top) + 'px, ' + '0)'
				});
				$scope.containerBackground.addClass('hidden');
				$scope.detailsContainer.addClass('hidden');
				$scope.singleItem.css({
					'transform':'scale3d('+$scope.imgScale+', '+$scope.imgScale+', 1) translate3d(0px, 0px, 0)',
					'z-index': '2'
				});
				$('.get-single-item-description, .get-single-item-dibs-button').addClass('hidden');
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

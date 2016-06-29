stuffMapp.controller('getItemController', ['$scope', '$http', '$stateParams', '$userData', GetItemController]);
function GetItemController() {
	'use strict';
	var $scope = arguments[0];
	var $http = arguments[1];
	var $stateParams = arguments[2];
	var $userData = arguments[3];
	$http.get(config.api.host + 'api/' + config.api.version + '/stuff/id/' + $stateParams.id).success(function(data) {
		$scope.listItem = data.res;
		console.log(data.res);
		$scope.markers.forEach(function(e) {
			if(e.data.id === $scope.listItem.id) {
				console.log(e.data.id);
				e.data.selected = true;
				$scope.resizeMarkers();
			}
		});
		$scope.imgScale = 1;
		var aspectRatio = (($('#get-item-single-container-'+$stateParams.id).width()/$('#get-item-single-container-'+$stateParams.id).height())>(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').height())));
		$scope.imgScale = ($('#post-item-' + $stateParams.id + ' img').height())/($('#masonry-container').height()*0.4);
		$scope.container = $('<div>', {id:'get-item-single-'+$stateParams.id, class:'get-item-single-container animate-250'});
		$scope.imageContainer = $('<div>', {class:'get-item-single-image-container animate-250'});
		$scope.detailsContainer = $('<div>', {class:'get-item-single-details-container hidden animate-250'});
		$scope.containerBackground = $('<div>', {class:'get-item-single-background animate-250 hidden'});
		$scope.imageContainer.css({
			'transform' : 'translate3d(' + ($('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left)+'px, '+($('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top) + 'px, ' + '0)'
		});
		$scope.detailsContainer.html([
			'<a id="get-single-item-dibs-button" class="get-item-single-dibs-button">Dibs!</a>',
			'<h2 class="get-item-single-title">'+data.res.title+'</h2>',
			'<p class="get-item-single-description">'+data.res.description+'</p>',
			'<div class="">',
			'	<div class="get-item-single-category"></div><div class="get-item-single-time"></div>',
			'</div>'
		].join('\n'));
		$scope.singleItem = $('#post-item-' + $stateParams.id + ' img')
		.clone()
		.attr('id', 'get-item-single-container-' + $stateParams.id)
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
		$scope.container.appendTo('#masonry-container');
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
					'<h3 class="get-single-item-description hidden animate-250">\n',
					'	'+$scope.listItem.description,
					'</h3>'
				].join('\n'));
				var $el = ($('#get-item-single'+$stateParams.id).append('<button class="get-single-item-dibs-button hidden animate-250" ng-click="dibsItem()">Dibs!</button>'));
				requestAnimationFrame(function() {
					$('.get-single-item-description, .get-single-item-dibs-button').removeClass('hidden');
					checkScroll();
				});
			});
		});
	});
	$('body').on('click', dibsItem);
	function dibsItem(e) {
		if(e.target.id === 'get-single-item-dibs-button') {
			console.log('ID: '+$stateParams.id);
			$http.post('/api/v1/dibs/'+$stateParams.id).success(function(data) {
				console.log(data.err);
				console.log(data.res);
			});
		}
	}

	function checkScroll() {
		var div = $scope.detailsContainer[0];
		var hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
		console.log(hasVerticalScrollbar);
	}
	$scope.$on('$destroy', function() {
		$scope.markers.forEach(function(e) {
			if(e.data.id === $scope.listItem.id) {
				console.log(e.data.id);
				e.data.selected = false;
				$scope.resizeMarkers();
			}
		});
		$('body').off('click', dibsItem);
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

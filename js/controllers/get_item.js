stuffMapp.controller('getItemController', ['$scope', '$http', '$stateParams', '$userData', GetItemController]);
function GetItemController() {
	'use strict';
	var $scope = arguments[0];
	var $http = arguments[1];
	var $stateParams = arguments[2];
	var $userData = arguments[3];
	$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/id/' + $stateParams.id).success(function(data) {
		$scope.listItem = data.res;
		console.log(data.res);
		$scope.markers.forEach(function(e) {
			if(e.data.id === $scope.listItem.id) {
				console.log(e.data.id);
				e.data.selected = true;
				//$scope.resizeMarkers();
				google.maps.event.trigger($scope.map, 'zoom_changed');
				$scope.map.panTo(new google.maps.LatLng(e.data.lat, e.data.lng));
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
		$scope.paymentForm = $('<div>', {class:'get-item-single-payment-modal animate-250 hidden'});
		$scope.paymentForm.html([
			'<form id="checkout" method="post" action="/checkout">',
			'	<div id="payment-form'+$stateParams.id+'"></div>',
			'	<input type="submit" value="Pay $10">',
			'</form>'
		].join('\n'));
		$scope.detailsContainer.html([
			'<a id="get-single-item-dibs-button'+$stateParams.id+'" class="get-item-single-dibs-button">Dibs!</a>',
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
		$scope.paymentForm.appendTo($scope.container);
		$scope.containerBackground.appendTo($scope.container);
		$scope.singleItem.appendTo($scope.imageContainer);
		$scope.imageContainer.appendTo($scope.container);
		$scope.detailsContainer.appendTo($scope.container);
		$scope.container.appendTo('#get-stuff-container');
		requestAnimationFrame(function() {
			requestAnimationFrame(function() {
				initPayment();
				initListener();
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
	function initPayment() {
		console.log('Payment initialized');
		console.log($('#get-single-item-dibs-button'+$stateParams.id));
		var clientToken = "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiJiYjdjOTBlNzQ2MDk1ZWUzNjQ3ZTk0NDkxNzU2MWY5ZjJiMWUzM2FhZjQ4M2YwMWRjZGQwZThhMWUzYTgwNmQxfGNyZWF0ZWRfYXQ9MjAxNi0wNy0wMVQxNzoxNjo1MS4zODU3OTMwNDQrMDAwMFx1MDAyNm1lcmNoYW50X2lkPTM0OHBrOWNnZjNiZ3l3MmJcdTAwMjZwdWJsaWNfa2V5PTJuMjQ3ZHY4OWJxOXZtcHIiLCJjb25maWdVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvMzQ4cGs5Y2dmM2JneXcyYi9jbGllbnRfYXBpL3YxL2NvbmZpZ3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbXSwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwiY2xpZW50QXBpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzLzM0OHBrOWNnZjNiZ3l3MmIvY2xpZW50X2FwaSIsImFzc2V0c1VybCI6Imh0dHBzOi8vYXNzZXRzLmJyYWludHJlZWdhdGV3YXkuY29tIiwiYXV0aFVybCI6Imh0dHBzOi8vYXV0aC52ZW5tby5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIiwiYW5hbHl0aWNzIjp7InVybCI6Imh0dHBzOi8vY2xpZW50LWFuYWx5dGljcy5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tLzM0OHBrOWNnZjNiZ3l3MmIifSwidGhyZWVEU2VjdXJlRW5hYmxlZCI6dHJ1ZSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImRpc3BsYXlOYW1lIjoiQWNtZSBXaWRnZXRzLCBMdGQuIChTYW5kYm94KSIsImNsaWVudElkIjpudWxsLCJwcml2YWN5VXJsIjoiaHR0cDovL2V4YW1wbGUuY29tL3BwIiwidXNlckFncmVlbWVudFVybCI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBheXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJhbGxvd0h0dHAiOnRydWUsImVudmlyb25tZW50Tm9OZXR3b3JrIjp0cnVlLCJlbnZpcm9ubWVudCI6Im9mZmxpbmUiLCJ1bnZldHRlZE1lcmNoYW50IjpmYWxzZSwiYnJhaW50cmVlQ2xpZW50SWQiOiJtYXN0ZXJjbGllbnQzIiwiYmlsbGluZ0FncmVlbWVudHNFbmFibGVkIjp0cnVlLCJtZXJjaGFudEFjY291bnRJZCI6ImFjbWV3aWRnZXRzbHRkc2FuZGJveCIsImN1cnJlbmN5SXNvQ29kZSI6IlVTRCJ9LCJjb2luYmFzZUVuYWJsZWQiOmZhbHNlLCJtZXJjaGFudElkIjoiMzQ4cGs5Y2dmM2JneXcyYiIsInZlbm1vIjoib2ZmIn0=";

		braintree.setup(clientToken, "dropin", {
			container: 'payment-form'+$stateParams.id
		});
	}
	function initListener() {
		$('#get-single-item-dibs-button'+$stateParams.id).on('click', dibs);
	}
	function dibs() {
		// $http.post(config.api.host + '/api/v'+config.api.version+'/dibs/'+$stateParams.id).success(function(data) {
		// 	console.log(data.err);
		// 	console.log(data.res);
		// });
	}
	function checkScroll() {
		var div = $scope.detailsContainer[0];
		var hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
		console.log(hasVerticalScrollbar);
	}
	$scope.$on('$destroy', function() {
		$('#get-stuff-back-button-container').addClass('hidden');
		$('.get-stuff-back-button').addClass('hidden');
		$('#get-stuff-item-title').addClass('hidden');
		$('#get-single-item-dibs-button'+$stateParams.id).off('click', dibs);
		$scope.markers.forEach(function(e) {
			if(e.data.id === $scope.listItem.id) {
				console.log(e.data.id);
				e.data.selected = false;
				//$scope.resizeMarkers();
				google.maps.event.trigger($scope.map, 'zoom_changed');
			}
		});
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

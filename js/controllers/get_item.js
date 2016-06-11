function GetItemController($scope, $http, $stateParams, $userData, $compile) {
	$http.get(config.api.host + 'api/' + config.api.version + '/stuff/id/' + $stateParams.id
	).success(function(data) {
		$scope.listItem = data.res;
		$scope.marker = {};
		$scope.marker = new google.maps.Marker({
			position: {
				lat: $scope.listItem.lat,
				lng : $scope.listItem.lng
			},
			icon: '/img/circle.png',
			map: $scope.map,
			data: $scope.listItem.id
		});
		$scope.map.panTo(new google.maps.LatLng($scope.listItem.lat, $scope.listItem.lng));
		$scope.marker.addListener('click', function(e) {

		});
		$('#post-item-'+$stateParams.id)
		.clone()
		.attr('id', 'get-item-single' + $stateParams.id)
		.addClass('animate-250')
		.css({
			'position': 'absolute',
			'top': $('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top + $('#masonry-container').position().top,
			'left': $('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left,
			'z-index': '10',
			'width': $('#post-item-' + $stateParams.id).width(),
			'height': $('#post-item-' + $stateParams.id).height()
		})
		.appendTo('#masonry-container');
		requestAnimationFrame(function() {
			requestAnimationFrame(function() {
				$('#post-item-'+$stateParams.id).css({'opacity':0.0001});
				$('#get-item-single'+$stateParams.id).css({
					'position': 'absolute',
					'width': '100%',
					'height': 'calc(100% - 45px)',
					'left': '0px',
					'top': '45px'
				});
				$('#get-item-single'+$stateParams.id + ' .get-stuff-item-info').addClass('get-single-item-info').append([
					'<h3 class="get-single-item-description hidden animate-250">\n',
					'	'+$scope.listItem.description,
					'</h3>'
				].join('\n'));
				var $el = ($('#get-item-single'+$stateParams.id).append('<button class="get-single-item-dibs-button hidden animate-250" ng-click="dibsItem()">Dibs!</button>'));
				requestAnimationFrame(function() {
					$('.get-single-item-description, .get-single-item-dibs-button').removeClass('hidden');
				});
			});
		});
	});
	$('body').on('click', dibsItem);
	function dibsItem(e) {
		if(e.target.className === 'get-single-item-dibs-button animate-250') {
			console.log('ID: '+$stateParams.id);
			$http.post('/api/v1/dibs/'+$stateParams.id).success(function(data) {
				console.log(data.res);
			});
		}
	}
	$scope.$on('$destroy', function() {
		$('body').off('click', dibsItem);
		$('#get-item-single'+$stateParams.id).css({
			'position': 'absolute',
			'top': $('#post-item-'+$stateParams.id).offset().top - $('#masonry-container').offset().top + $('#masonry-container').position().top,
			'left': $('#post-item-'+$stateParams.id).offset().left - $('#masonry-container').offset().left,
			'z-index': '10',
			'width': $('#post-item-'+$stateParams.id).width(),
			'height': $('#post-item-'+$stateParams.id).height()
		});
		$('.get-single-item-description, .get-single-item-dibs-button').addClass('hidden');
		setTimeout(function() {
			$('#post-item-'+$stateParams.id).css({'opacity': ''});
			requestAnimationFrame(function() {
				requestAnimationFrame(function() {
					$('#get-item-single'+$stateParams.id).remove();
				});
			});
		}, 250);
		$scope.marker.setMap(null);
	});
}

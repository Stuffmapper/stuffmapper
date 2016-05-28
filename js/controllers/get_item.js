function GetItemController($scope, $http, $stateParams, $userData) {
	$http({
		method: 'GET',
		url: config.api.host + 'api/' + config.api.version + '/stuff/' + $stateParams.id
	}).then(function(data) {
		$scope.listItem = data.data[0];
		$scope.marker = {};
		$scope.marker = new google.maps.Marker({
			position: {
				lat: $scope.listItem.lat,
				lng : $scope.listItem.lng
			},
			icon: '/img/circle.png',
			map: $scope.map
		});
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
			$('#post-item-'+$stateParams.id).css({'opacity':0.0001});
			$('#get-item-single'+$stateParams.id).css({
				'position': 'absolute',
				'width': '100%',
				'height': 'calc(100% - 45px)',
				'left': '0px',
				'top': '45px'
			});
		});
	});
	$scope.$on("$destroy", function() {
		$('#get-item-single'+$stateParams.id).css({
			'position': 'absolute',
			'top': $('#post-item-'+$stateParams.id).offset().top - $('#masonry-container').offset().top + $('#masonry-container').position().top,
			'left': $('#post-item-'+$stateParams.id).offset().left - $('#masonry-container').offset().left,
			'z-index': '10',
			'width': $('#post-item-'+$stateParams.id).width(),
			'height': $('#post-item-'+$stateParams.id).height()
		});
		setTimeout(function() {
			$('#post-item-'+$stateParams.id).css({'opacity': ''});
			requestAnimationFrame(function() {
				$('#get-item-single'+$stateParams.id).remove();
			});
		}, 260);
		$scope.marker.setMap(null);
	});
}

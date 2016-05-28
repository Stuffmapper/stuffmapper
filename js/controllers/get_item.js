function GetItemController($scope, $http, $stateParams, $userData) {
	console.log('asdfasdfsadf');
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
	});
	$('#post-item-'+$stateParams.id).css({
		'position': 'fixed',
		'width': '100%',
		'height': 'calc(100% - 45px)',
		'left': '0px',
		'top': '45px'
	});
	$scope.$on("$destroy", function() {
		$('#post-item-'+$stateParams.id).css({
			'position': '',
			'width': '',
			'height': '',
			'left': '',
			'top': ''
		});
		$('#getstuff a').removeClass('selected');
		$scope.marker.setMap(null);
	});
}

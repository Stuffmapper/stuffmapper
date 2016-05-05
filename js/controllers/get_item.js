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
    });
    $scope.$on("$destroy", function() {
        $('#getstuff a').removeClass('selected');
        $scope.marker.setMap(null);
    });
}

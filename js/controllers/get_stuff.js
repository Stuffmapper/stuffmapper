function GetStuffController($scope, $http, $timeout, $userData) {
    $('#tab-container .stuff-tabs .get-stuff-tab a').addClass('selected');
    $http({
        method: 'GET',
        url: config.api.host + 'api/' + config.api.version + '/stuff/'
    }).success(function(data) {
        $scope.listItems = data;
        $scope.markers = [];
        $scope.infowindows = [];
        $scope.filterOptions = [
            'thing',
            'stuff'
        ];
        $scope.filterPaneOpen = false;
        $scope.toggleFilterPane = function() {
            $('#filter-pane').toggleClass('open-filter-pane');
        };
        var tempSearchText = '';
        var searchTextTimeout;
        var lastSearch;
        $scope.$watch('searchStuff', function (val) {
            if (searchTextTimeout) {
                $timeout.cancel(searchTextTimeout);
            }
            else {
                console.log('Search for everything');
            }
            tempSearchText = val;
            searchTextTimeout = $timeout(function() {
                if(tempSearchText) {
                    $scope.filterText = tempSearchText;
                    if(tempSearchText !== lastSearch) {
                        lastSearch = tempSearchText;
                    }
                }
                else if(tempSearchText !== undefined) {
                    console.log('Search for everything');
                }
            }, 250);
        });
        $scope.listItems.forEach(function(e) {
            $scope.markers.push(new google.maps.Marker({
                position: {
                    lat: e.lat,
                    lng : e.lng
                },
                icon: '/img/circle.png',
                map: $scope.map
            }));
            var contentString = [
                '<div style="width: 180px; height: 300px;">',
                '   <div style="font-size: 16px">'+e.title+'</div>',
                '   <div style="background-image: url('+e.img+');position:absolute;width: 200px; height: 270px;top:25px"></div>',
                '</div>'
            ].join('\n');
            $scope.infowindows.push(new google.maps.InfoWindow({
                content: contentString
            }));
            var infowindow = $scope.infowindows[$scope.infowindows.length - 1];
            $scope.markers[$scope.markers.length - 1].addListener('click', function(event) {
                $scope.infowindows.forEach(function(e) {
                    e.close();
                });
                infowindow.open($scope.map, this);
            });
        });
        $scope.$on("$destroy", function() {
            $('#tab-container .stuff-tabs .get-stuff-tab a').removeClass('selected');
            $scope.infowindows.forEach(function(e) {
                e.close();
            });
            $scope.markers.forEach(function(e) {
                e.setMap(null);
            });
        });
    });
}

function GetStuffController($scope, $http, $timeout, $userData) {
	$('#tab-container .tabs .get-stuff-tab a').addClass('selected');
	$http({
		method: 'GET',
		url: config.api.host + 'api/' + config.api.version + '/stuff/'
	}).then(function(data) {
		$scope.listItems = data.data;
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

		$scope.toggleSwitch = function() {
			$('.toggle-button').toggleClass('toggle-button-selected');
		};

		var mapAnimationTimeout;
		var mapIsOpen = true;
		$scope.toggleMap = function() {
			if(mapAnimationTimeout) clearTimeout(mapAnimationTimeout);
			if(mapIsOpen) {
				requestAnimationFrame(function() {
					$('#masonry-container').removeClass('hide-masonry-container');
					$('#map-view').removeClass('map-view-open');
				});
			}
			else {
				mapAnimationTimeout = setTimeout(function() {
					requestAnimationFrame(function() {
						$('#map-view').addClass('map-view-open');
					});
				}, 250);
				requestAnimationFrame(function() {
					$('#masonry-container').addClass('hide-masonry-container');
				});
			}
			mapIsOpen = !mapIsOpen;
		};

		$scope.initMasonry = function() {
			$('.masonry-grid').masonry({
				columnWidth: function(columnWidth) {
					return $('.masonry-grid').width()/2;
				}(),
				itemSelector: '.masonry-grid-item',
				isAnimated: true
			}).imagesLoaded(function(){
				$('.masonry-grid').masonry('reloadItems').masonry();
			});
			$(window).resize(function() {
				$('.masonry-grid').masonry({
					columnWidth: function(columnWidth) {
						return $('.masonry-grid').width()/2;
					}(),
					itemSelector: '.masonry-grid-item',
					isAnimated: true
				});
			});
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
			$('#tab-container .tabs .get-stuff-tab a').removeClass('selected');
			$scope.infowindows.forEach(function(e) {
				e.close();
			});
			$scope.markers.forEach(function(e) {
				e.setMap(null);
			});
		});
	});
}

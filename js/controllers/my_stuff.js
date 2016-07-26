stuffMapp.controller('myStuffController', ['$scope', '$http', '$userData', 'authenticator', '$state', MyStuffController]);
function MyStuffController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $userData = arguments[2];
	var authenticator = arguments[3];
	var $state = arguments[4];
	authenticator.then(function(data) {
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
		} else {
			$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/my').success(function(data) {
				$scope.listItems = data.res.rows;
				console.log(data);
				// $('#mystuff a').addClass('selected');
				// $scope.$on("$destroy", function() {
				//     $('#mystuff a').removeClass('selected');
				// });
				$scope.initMasonry = function() {
					$('.masonry-grid').masonry({
						columnWidth: $('.masonry-grid').width()/2,
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
			});
		}
	});
}

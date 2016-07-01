stuffMapp.controller('myStuffController', ['$scope', '$http', '$userData', MyStuffController]);
function MyStuffController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $userData = arguments[2];
	$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/').success(function(data) {
		$scope.listItems = data;
    // $('#mystuff a').addClass('selected');
    // $scope.$on("$destroy", function() {
    //     $('#mystuff a').removeClass('selected');
    // });

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
	});
}

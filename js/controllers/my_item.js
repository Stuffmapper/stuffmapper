stuffMapp.controller('myItemsController', ['$scope', MyItemsController]);
function MyItemsController() {
	var $scope = arguments[0];
	$('#mystuff a').addClass('selected');
	$scope.$on("$destroy", function() {
		$('#mystuff a').removeClass('selected');
	});
}

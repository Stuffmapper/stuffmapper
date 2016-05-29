function WatchListController($scope, $location, authentication) {
	if(!authenticated.res.loggedIn) {
		$location.path('stuff/get');
		return;
	}
	// $('#mystuff a').addClass('selected');
	// $scope.$on("$destroy", function() {
	// 		$('#mystuff a').removeClass('selected');
	// });
	$scope.tagnames = [
                    { 'tagname':'desk'},
                    { 'tagname':'couch'},
	                  { 'tagname':'table'},
		                { 'tagname':'books'},
			              { 'tagname':'electronics'},
                    ];
	$scope.addRow = function(){
		$scope.tagnames.push({ 'tagname':$scope.tagname});
		$scope.tagname='';
	};
	$scope.submitTagName = function() {

	};
}

function WatchListController($scope, $location, authenticated) {
	if(!authenticated.res.loggedIn) {
		$location.path('stuff/get');
		return;
	}
	// $('#mystuff a').addClass('selected');
	// $scope.$on("$destroy", function() {
	// 		$('#mystuff a').removeClass('selected');
	// });
	$scope.tagnames = [
                    {'tagname':'desk'},
                    {'tagname':'couch'},
	                  {'tagname':'table'},
		                {'tagname':'books'},
			              {'tagname':'toys'},
										{'tagname':'baby'},
                    {'tagname':'phone'},
	                  {'tagname':'shoes'},
		                {'tagname':'art'},
			              {'tagname':'sports'},
										{'tagname':'education'},
                    {'tagname':'auto'},
	                  {'tagname':'beauty'},
		                {'tagname':'misc'},
			              {'tagname':'electronics'}
                    ];
	$scope.addRow = function(){
		$scope.tagnames.push({ 'tagname':$scope.tagname});
		$scope.tagname='';
	};
}

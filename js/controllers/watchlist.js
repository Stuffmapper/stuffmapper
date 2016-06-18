
stuffMapp.controller('watchlistController', ['$scope', '$location', 'authenticated', WatchListController]);
function WatchListController() {
	var $scope = arguments[0];
	var $location = arguments[1];
	var authenticated = arguments[2];
	if(!authenticated.res.loggedIn) {
		$location.path('stuff/get');
		return;
	}

	$scope.getAll = function() {
	$http.get('/api/watchlist')
		.then(function(res) {
			$scope.watchlist = res.data;
		}, function(err) {
			console.log(err.data);
		});
	};

	$scope.create = function(tag_name) {
		$http.post('/api/watchlist', $scope.watchlist_items._id,{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data){
				return $.param(data);
			}
		}).success(function(data) {

				console.log(data);
			});
		};

	$scope.remove = function(tagname) {
		$scope.watchlist_items.splice($scope.watchlist_items.indexOf(watchlist_item), 1);
		$http.delete('/api/watchlist/' + watchlist_item._id)
			.then(function(res) {
				console.log('watchlist item deleted');
			}, function(err) {
				console.log(err.data);
				$scope.errors.push('could not delete watchlist_item: ' + tagname.name);
				$scope.getAll();
			});
	};
}

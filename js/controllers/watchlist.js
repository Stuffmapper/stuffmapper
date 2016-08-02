stuffMapp.controller('watchlistController', ['$scope', '$http', '$location', '$state', 'authenticator', WatchListController]);
function WatchListController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $location = arguments[2];
	var $state = arguments[3];
	var authenticator = arguments[4];
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(data){
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
		} else {
			$scope.getAll = function() {
				$http.get(config.api.host + '/api/v' + config.api.version + '/watchlist')
				.then(function(res) {
					$scope.watchlist = res.data.res;
				}, function(err) {
				});
			};

			$scope.create = function() {
				var keys = $('#watchlist-select').val();
				if (keys) {
					$http.post('/api/v1/watchlist', {keys: keys}, {
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
						},
						transformRequest: function(data){
							return $.param(data);
						}
					}).success(function(data) {
						if (!data.err) {
							var newWatchlist_item = [];
							keys.forEach(
								function(e) {
									newWatchlist_item.push({tag_name:e});
								}
							);
							$scope.watchlist.push(newWatchlist_item);
						}
					});
				}
			};

			$scope.remove = function(tagname) {
				$scope.watchlist_items.splice($scope.watchlist_items.indexOf(watchlist_item), 1);
				$http.delete('/api/v1/watchlist/' + watchlist_item._id)
				.then(function(res) {
				}, function(err) {
					$scope.errors.push('could not delete watchlist_item: ' + tag_name.name);
					$scope.getAll();
				});
			};
			$scope.clearField = function() {
				$('#watchlist-select').val('');
			};
		}
		$scope.selections = function() {
			$('#watchlist-select').select2({
				placeholder: 'Search for tag names',
				allowClear: true,
				tags: true,
				tokenSeparators: [',', ' '],
				ajax: {
					url: '/api/v1/categoriesandtags',
					dataType: 'json',
					delay: 250,
					data: function (params) {
						return {
							q: params.term, // search term
							page: params.page
						};
					},
					processResults: function (data, params) {
						// parse the results into the format expected by Select2
						// since we are using custom formatting functions we do not need to
						// alter the remote JSON data, except to indicate that infinite
						// scrolling can be used
						params.page = params.page || 1;

						return {
							results: data.res
						};
					},
					cache: true
				},
				escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
				minimumInputLength: 1
			});
		};
	});
}

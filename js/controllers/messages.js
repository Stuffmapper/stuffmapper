function MessagesController($scope) {
    $('#mystuff a').addClass('selected');
    $scope.$on("$destroy", function() {
        $('#mystuff a').removeClass('selected');
    });
}

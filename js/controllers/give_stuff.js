function GiveStuffController($scope) {
    $('#tab-container .tabs .give-stuff-tab a').addClass('selected');
    $scope.$on("$destroy", function() {
        $('#tab-container .tabs .give-stuff-tab a').removeClass('selected');
    });
}

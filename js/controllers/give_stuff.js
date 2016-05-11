function GiveStuffController($scope) {
    $('#tab-container .stuff-tabs .give-stuff-tab a').addClass('selected');
    $scope.$on("$destroy", function() {
        $('#tab-container .stuff-tabs .give-stuff-tab a').removeClass('selected');
    });
}

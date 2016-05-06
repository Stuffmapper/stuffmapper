<<<<<<< HEAD
function GiveStuffController($scope) {
    $('#tab-container .tabs .give-stuff-tab a').addClass('selected');
    $scope.$on("$destroy", function() {
        $('#tab-container .tabs .give-stuff-tab a').removeClass('selected');
    });
}
=======
function GiveStuffController($scope) {
    $('#tab-container .tabs .give-stuff-tab a').addClass('selected');
    $scope.$on("$destroy", function() {
        $('#tab-container .tabs .give-stuff-tab a').removeClass('selected');
    });
}
>>>>>>> 165b547c0bf52b4867c71861d2922c16df238a50

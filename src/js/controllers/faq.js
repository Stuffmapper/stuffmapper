stuffMapp.controller('faqController', ['$scope','$document', '$log', FaqController]);
function FaqController($scope, $document, $log) {

    $scope.gotoElement = function (id) {
        $('.faq-container').animate({
            scrollTop: $("#"+id).offset().top
        }, 2000);

    }

}

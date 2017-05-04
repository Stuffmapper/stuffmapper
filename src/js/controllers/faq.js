stuffMapp.controller('faqController', ['$scope','$document', FaqController]);
function FaqController($scope, $document) {

    $scope.gotoElement = function (id) {
        $('.faq-container').animate({
            scrollTop: $("#"+id).offset().top
        }, 2000);

    }

}

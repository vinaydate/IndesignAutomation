/**
 * Created by Vinay on 13-Jun-14.
 */

/*global angular */

angular.module('App').directive('dpTypeahead', ['$timeout', function($timeout) {
    'use strict';
    return {
        restrict: 'AEC',
        scope: {
            items: '=',
            prompt: '@',
            title: '@',
            subtitle: '@',
            model: '='
            /*onSelect: '&amp;'*/
        },
        link: function(scope, elem, attrs) {
            scope.handleSelection = function(selectedItem) {
                scope.model = selectedItem;
                scope.current = 0;
                scope.selected = true;
                $timeout(function() {
                    scope.onSelect();
                }, 200);
            };
            scope.current = 0;
            scope.selected = true; // hides the list initially
            scope.isCurrent = function(index) {
                return scope.current === index;
            };
            scope.setCurrent = function(index) {
                scope.current = index;
            };
        },
        templateUrl: 'Features/UI/typeAhead.html'
    };
}]);


angular.module('App').controller('TypeAheadController', ['$scope', function($scope) { // DI in action
    'use strict';
    $scope.name = ''; // This will hold the selected item
    $scope.onItemSelected = function() { // this gets executed when an item is selected
        /*console.log('selected=' + $scope.name);*/
    };
}]);
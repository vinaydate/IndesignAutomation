/*jslint browser: true*/
/*global $, angular*/
/* Controllers */

// Declare app level module which depends on filters, and services
PanchaangaIndApp.controller('Itara', ['$scope', 'PanchaangaData', '$rootScope', 'ErrorService', function ($scope, PanchaangaData, $rootScope, ErrorService) {
    'use strict';

    $scope.fromYear = 2016;
    $scope.toYear = 2025;
    $scope.buttonText = "Calculate";
    $scope.processing = false;
    $scope.processed = false;

    $scope.sayHello = function () {
        $rootScope.Indesign.evalScript('placeData(' + $scope.fromYear + ')');
    };
    $scope.calculate = function () {
        if (!$scope.processed) {
            $scope.processing = true;
            PanchaangaData.Ephemeris().get({ fromyear: $scope.fromYear, toyear: $scope.toYear })
                .$promise.then(function (data) {
                    $scope.processing = false;
                    $scope.processed = true;
                    $scope.buttonText = "Prepare";
                    $scope.data = data;
                }, function (error) {
                    $scope.processing = false;
                    if (error.status !== 0) {
                        $rootScope.$broadcast($rootScope.AlertModal,
                            {
                                Header: "Alert",
                                Text: "Problem in retrieving data from Panchang calculation service. Error: " + angular.toJson(error)
                            }
                        );
                    }
                }, function (update) {
                    alert('Got notification: ' + update);
                }
            );
        }
        else{
            $rootScope.Indesign.evalScript('Ephemeris.prepare(' + angular.toJson($scope.data) + ')');
            $scope.processed = false;
            $scope.buttonText = "Calculate";
        }
    };

    $scope.abort = function () {
        $scope.processing = false;
        PanchaangaData.Abort();
    };
}]);
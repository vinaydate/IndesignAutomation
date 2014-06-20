/*jslint browser: true*/
/*global $, angular*/
/* Controllers */

// Declare app level module which depends on filters, and services
var PanchaangaIndApp = angular.module('PanchaangaIndApp', [
    'ngRoute',
    'ngResource'
]).controller('Data', ['$scope', '$resource', function ($scope, $resource) {
    'use strict';
    $scope.processKoshha = function() {
        $scope.fetchKoshha();
        $scope.pushToAzure();
    };

    $scope.fetchKoshha = function () {
        var service = $resource('http://localhost:33337/api/bhaashhaa', {});
        service.query(function (data) {
            $scope.values = data;
        }, function (error) {
            $scope.values = 'error: ' + error;
        });
    };
    $scope.pushToAzure = function () {
        var localStorage = 'http://127.0.0.1:10002/devstoreaccount1/Koshha';
        var cloudStorage = 'http://dpinhouse.table.core.windows.net/Koshha';
        var service = $resource(localStorage, {});
        service.save($scope.values);
    };
}])
    .controller('Sthaana', ['$scope', '$resource', function ($scope, $resource) {
        'use strict';
    }])
    .controller('Ganita', ['$scope', '$resource', "$http", '$rootScope', function ($scope, $resource, $http, $rootScope) {
        'use strict';

    }]);
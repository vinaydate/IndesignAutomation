/**
 * Created by Vinay on 02-Jul-14.
 */
/*jslint browser: true*/
/*global $, Enumerable, angular, PanchaangaIndApp, console */

angular.module('App').service('PanchaangaData', ['$resource', 'ErrorService', '$log', '$q', '$rootScope', function ($resource, ErrorService, $log, $q, $rootScope) {
    'use strict';

    var panchaangaData = this;
    var canceller = {};

    panchaangaData.Ephemeris = function () {
        //noinspection JSUnresolvedVariable
        canceller = $q.defer();
        return $resource($rootScope.DataUrl + '/panchang/ephemeris?fromyear=:fromyear&toyear=:toyear', {},
            {
                'get': {
                    method: 'GET',
                    timeout: canceller.promise,
                    cache: true
                }
            });
    };

    panchaangaData.Abort = function () {
        canceller.resolve(); //aborts request
    };
}]);
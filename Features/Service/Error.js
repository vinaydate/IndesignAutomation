/**
 * Created by Vinay on 08-Jun-14.
 */

/*global $, angular, Enumerable, PanchaangaIndApp, console */

angular.module('App').service('ErrorService', ['$rootScope', '$log', function ($rootScope, $log) {
    'use strict';

    var warnings = 'Warnings';

    $rootScope.HasWarnings = false;

    this.AddWarning = function (title, text, description) {
        if(!$rootScope.hasOwnProperty(warnings)) {
            $rootScope[warnings] = [];
        }
        $rootScope[warnings].push({ Title : text, Description: description });

        $rootScope.HasWarnings = $rootScope[warnings].length > 0;
        $log.warn(title + ": " + text);
    };

    this.RemoveWarning = function (title, log) {
        if(!$rootScope.hasOwnProperty(warnings)) {
            $rootScope[warnings] = [];
        }
        var toRemove = Enumerable.from($rootScope[warnings]).indexOf(function(item) { return item.Title === title; });
        if (toRemove >= 0) {
            $rootScope[warnings].splice(toRemove, 1);
            $rootScope.HasWarnings = $rootScope[warnings].length > 0;
            $log.warn(title + ": Warning removed.");
            if (log) {
                $log.warn(log);
            }
        }
    };
}]);
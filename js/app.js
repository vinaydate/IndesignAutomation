/*jslint browser: true*/
/*global $, angular, CSInterface, SystemPath, themeManager, console */


// Declare app level module which depends on filters, and services

var PanchaangaIndApp = angular.module('App', [
    'ngRoute',
    'ngResource'
]).config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/वार्षिक', {templateUrl: 'partials/Vaarshhika.html', controller: 'Vaarshhika'});
    $routeProvider.when('/दिनविशेष', {templateUrl: 'partials/DinaVisheshha.html', controller: 'DinaVisheshha'});
    $routeProvider.when('/पंचवर्षीय', {templateUrl: 'partials/PanchaVarshheeya.html', controller: 'PanchaVarshheeya'});
    $routeProvider.when('/दिनदर्शिका', {templateUrl: 'partials/Calendar.html', controller: 'Calendar'});
    $routeProvider.when('/इतर', {templateUrl: 'partials/Itara.html', controller: 'Itara'});
    $routeProvider.when('/व्यवस्था', {templateUrl: 'partials/Vyavasthaa.html', controller: 'Settings'});
    $routeProvider.otherwise({redirectTo: '/वार्षिक'});
}]).run(function ($rootScope) {
    'use strict';
    $rootScope.Indesign = new CSInterface();

    function showDevTools() {
        //noinspection JSLint
        window.__adobe_cep__.showDevTools();
    }

    // Reloads extension panel
    function reloadPanel() {
        location.reload();
    }

    function loadJSX() {
        var extensionRoot = $rootScope.Indesign.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
        //alert(extensionRoot);
        //$rootScope.Indesign.evalScript('alert("Shardul")');
        $rootScope.Indesign.evalScript('$._ext.evalFiles("' + extensionRoot + '")');
    }

    function init() {

        themeManager.init();

        loadJSX();

        $("#btn_debug").click(showDevTools);
        $("#btn_reload").click(reloadPanel);

        $rootScope.DataUrl = "http://localhost:16572"; // "http://datepanchang.azurewebsites.net";
    }

    init();
});




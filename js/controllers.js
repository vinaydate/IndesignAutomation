/*jslint browser: true*/
/*global $, PanchaangaIndApp, Enumerable, alert */
/* Controllers */

PanchaangaIndApp
    .controller('MainController', ['$scope', 'DataService', 'ErrorService', '$timeout', function ($scope, DataService, $timeout, ErrorService) {
        'use strict';
        $scope.sections = [
            {
                'title': 'वार्षिक'
            },
            {
                'title': 'दिनविशेष'
            },
            {
                'title': 'दिनदर्शिका'
            },
            {
                'title': 'पंचवर्षीय'
            },
            {
                'title': 'इतर'
            },
            {
                'title': 'व्यवस्था'
            }
        ];
        $scope.select = function (container) {
            $scope.selectedSection = container;
        };
        $scope.selectedSection = $scope.sections[0];

        $scope.selectSthaana = function (sthaana) {
            $scope.selectedSthaana = sthaana;
        };

        $scope.selectBhaashhaa = function (bhaashhaa) {
            $scope.selectedBhaashhaa = bhaashhaa;
        };

        $scope.selectedBhaashhaa = "Kannada Unicode";

        $scope.sthaanas = [{Name: 'Mumbai'}, { Name:'Pune'}];

        $scope.handlePlaceSelection = function(selectedItem) {
            $scope.selectedSthaana = selectedItem;
            $scope.sthaanaText = selectedItem.Name;
            $scope.currentPlaceIndex = 0;
            $scope.placeSelected = true;
            $timeout(function() {
                $scope.onSelect();
            }, 200);
        };
        $scope.sthaanaText = "";
        $scope.currentPlaceIndex = 0;
        $scope.placeSelected = true; // hides the list initially
        $scope.isCurrent = function(index) {
            return $scope.currentPlaceIndex === index;
        };
        $scope.setCurrent = function(index) {
            $scope.currentPlaceIndex = index;
        };

        var promise = DataService.ReadTables();
        promise.then(function() {
            $scope.bhaashhaas = DataService.Bhaashhaas;
            $scope.sthaanas = DataService.Sthaana;
            $scope.selectedSthaana = Enumerable.from(DataService.Sthaana).firstOrDefault(function(s){return s.Name === "Mumbai";});
            $scope.selectedBhaashhaa = "Marathi ISM";
        });
    }])
    .controller('Vaarshhika', ['$scope', '$resource', function ($scope, $resource) {
        'use strict';
    }])
    .controller('DinaVisheshha', ['$scope', '$resource', function ($scope, $resource) {
        'use strict';
    }])
    .controller('Itara', ['$scope', 'PanchaangaData', '$rootScope', 'ErrorService', function ($scope, PanchaangaData, $rootScope, ErrorService) {
        'use strict';

        $scope.fromYear = 2016;
        $scope.toYear = 2025;
        $scope.sayHello = function () {
            $rootScope.Indesign.evalScript('placeData(' + $scope.fromYear + ')');
        };
        $scope.prepare = function() {
            $scope.processing = true;
            PanchaangaData.Ephemeris().get({ fromyear: $scope.fromYear, toyear : $scope.toYear })
                .$promise.then(function(data) {
                        $scope.processing = false;
                        $rootScope.Indesign.evalScript('Ephemeris.prepare(' + JSON.stringify(data) + ')');
                    }, function(error) {
                        if(error.status !== 0) {
                            ErrorService.AddWarning('Calculation services', "Problem in retrieving data from Panchang calculation service.", error);
                        }
                    }, function(update) {
                        alert('Got notification: ' + update);
                    }
                );
        };

        $scope.abort = function() { $scope.processing = false; PanchaangaData.Abort(); };
    }]).controller('Settings', ['$scope', 'DataService', function ($scope, DataService) {
        'use strict';
        $scope.ResetDataFromWeb = function(){
            DataService.RestoreFromWeb(false);
        };
    }]);


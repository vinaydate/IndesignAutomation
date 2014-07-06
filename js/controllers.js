/*jslint browser: true*/
/*global $, PanchaangaIndApp, Enumerable, alert, CopyObject, angular */
/* Controllers */

PanchaangaIndApp
    .controller('MainController', ['$scope', 'DataService', 'ErrorService', '$timeout', '$rootScope', function ($scope, DataService, ErrorService, $timeout, $rootScope) {
        'use strict';
        $scope.modal = {
            Header : "",
            Text : "",
            withCancel : false
        };

        $scope.$on($rootScope.AlertModal, function(event, settings){
            CopyObject($scope.modal,settings);
            $('.ui.modal')
                .modal('show')
            ;
        });

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
    .controller('Settings', ['$scope', 'DataService', function ($scope, DataService) {
        'use strict';
        $scope.ResetDataFromWeb = function(){
            DataService.RestoreFromWeb(false);
        };
    }]);


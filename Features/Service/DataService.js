/**
 * Created by Vinay on 30-Apr-14.
 */
/*jslint browser: true*/
/*global $, Enumerable, angular, PanchaangaIndApp, console */

angular.module('App').service('DataService', ['$resource', 'ErrorService', '$log', '$q', '$rootScope', function ($resource, ErrorService, $log, $q, $rootScope) {
    'use strict';

    var localStorage = "Local Storage";
    var onlineStorage = "Online Storage";

    var dataService = this;
    dataService.dbReady = false;

    function initDB() {
        //noinspection JSUnresolvedVariable
        var deferred = $q.defer();
        if (!window.indexedDB) {
            window.alert("Your browser doesn't support a stable version of IndexedDB.");
            deferred.reject("Your browser doesn't support a stable version of IndexedDB.");
        }

        if (dataService.dbReady) {
            deferred.resolve('Database already initialized.');
        }

        var openRequest = window.indexedDB.open("DPInhouseDB", 5);

        openRequest.onerror = function (e) {
            ErrorService.AddWarning(localStorage, "Error in opening database", e.toString());
            deferred.reject("Error in opening database");
        };

        openRequest.onupgradeneeded = function (e) {

            dataService.DB = e.target.result;
            dataService.RestoreFromWeb(true);
        };

        openRequest.onsuccess = function (e) {
            dataService.DB = e.target.result;

            ErrorService.RemoveWarning(localStorage);

            dataService.DB.onerror = function (event) {
                // Generic error handler for all errors targeted at this database's
                // requests!
                ErrorService.AddWarning("Database Error:", event.target.errorCode);
            };

            dataService.dbReady = true;
            deferred.resolve('Database initialized.');
        };
        return deferred.promise;
    }

    dataService.ReadTables = function () {
        var deferred = $q.defer();
        deferred.notify('Reading Data');

        initDB().then(function () {
            readLocalTable('Sthaana')
                .then(function () {
                    dataService.Sthaana = Enumerable.from(dataService.Sthaana).orderBy(function(item) { return item.Name; }).toArray();
                    readLocalTable('Koshha').then(function () {
                        dataService.Bhaashhaas = Enumerable.from(dataService.Koshha).select(function (item) {
                            return item.PartitionKey;
                        }).distinct().toArray();
                        deferred.resolve('Data ready.');
                    });

                });
            });
        return deferred.promise;
    };

    var createTable = function (thisDb, tablename, indices, url, overwrite) {
        var objectStore;

        //Create Note OS
        if (overwrite) {
            if (thisDb.objectStoreNames.contains(tablename)) {
                thisDb.deleteObjectStore(tablename);
            }
            objectStore = thisDb.createObjectStore(tablename);

            for (var i = 0; i < indices.length; i++) {
                objectStore.createIndex(indices[i].fieldName, indices[i].fieldName, { unique: indices[i].unique });
            }
        }

        var webData = $resource(url, {});
        webData.query().$promise.then(function (data) {
                dataService.WriteLocalTable(tablename, data);
            },
            function (error) {
                ErrorService.AddWarning(onlineStorage, "Online data not available", error);
            }
        );

    };

    //TODO make arrangement for url input from user and use it
    //dataService.RootUrl = "http://localhost:16572"; // "http://datepanchang.azurewebsites.net";

    dataService.RestoreFromWeb = function (overwrite) {
        createTable(dataService.DB, "Sthaana",
            [
                { fieldName: "Name", unique: false},
                {fieldName: "PartitionKey", unique: false},
                {fieldName: "RowKey", unique: false}
            ], $rootScope.DataUrl + '/seva/sthaana', overwrite);
        createTable(dataService.DB, "Koshha",
            [
                {fieldName: "PartitionKey", unique: false},
                {fieldName: "RowKey", unique: false}
            ], $rootScope.DataUrl + '/seva/bhaashhaa?name=*', overwrite);
    };

    dataService.SyncWithWeb = function () {
        //TODO
    };

    function readLocalTable(tableName) {
        var deferred = $q.defer();
        if(dataService.dbReady) {
            var result = [];

            var transaction = dataService.DB.transaction([tableName], "readonly");
            var objectStore = transaction.objectStore(tableName);
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    result.push(cursor.value);
                    cursor.continue();
                }
            };

            transaction.onerror = function (event) {
                ErrorService.AddWarning(localStorage + " Read", "Error in reading data", event.toString());
                deferred.reject(tableName + 'could not be loaded.');
            };

            transaction.oncomplete = function (event) {
                ErrorService.RemoveWarning(localStorage + " Read", event.target.result);
                dataService[tableName] = result;
                deferred.resolve(tableName + ' table loaded.');
            };
        }
        else {
            deferred.reject('Database is not ready.');
        }
        return deferred.promise;
    }

    function reqSuccess(event) {
        $log.log("Record written in local storage: " + event.target.result);
    }

    dataService.WriteSthaana = function (sthaana) {
        dataService.WriteLocalTable('Sthaana', sthaana);
    };

    dataService.WriteShabda = function (shabda) {
        dataService.WriteLocalTable('Koshha', shabda);
    };

    dataService.WriteLocalTable = function (tableName, data) {
        if (dataService.dbReady) {

            var transaction = dataService.DB.transaction([tableName], "readwrite");
            var objectStore = transaction.objectStore(tableName);

            if (data instanceof Array) {
                for (var i = 0; i < data.length; i++) {
                    {
                        var request = objectStore.put(data[i], [data[i].PartitionKey, data[i].RowKey]);
                        request.onsuccess = reqSuccess;
                    }
                }
            }
            else {
                var request1 = objectStore.put(data, [data.PartitionKey, data.RowKey]);
                request1.onsuccess = function (event) {
                    $log.log("Record written in local storage: " + event.target.result);
                };
            }
            transaction.onerror = function (event) {
                ErrorService.AddWarning(localStorage + " Write", "Error in writing data", event.toString());
            };

            transaction.oncomplete = function (event) {
                ErrorService.RemoveWarning(localStorage + " Write", event.target.result);
            };
        }
    };
}]);
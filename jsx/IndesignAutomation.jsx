/*jslint browser: true*/
/*global $, alert, Folder */

if ($ === 'undefined') {
    //noinspection JSLint,JSValidateTypes
    $ = {};
}


//noinspection JSLint,SpellCheckingInspection
$._ext = {
    //Evaluate a file and catch the exception.

    evalFile: function(path) {
        'use strict';
        try {
            $.evalFile(path);
        } catch (e) {
            alert("Exception:" + e);
        }
    },
    // Evaluate all the files in the given folder 
    evalFiles: function(jsxFolderPath) {
        'use strict';
        var i, jsxFiles, folder, jsxFile;
        folder = new Folder(jsxFolderPath);
        if (folder.exists) {
            //noinspection JSUnresolvedFunction
            jsxFiles = folder.getFiles("*.jsx");
            /*jslint plusplus: true */
            for (i = 0; i < jsxFiles.length; i++) {
                jsxFile = jsxFiles[i];
                //noinspection JSLint
                $._ext.evalFile(jsxFile);
            }
        }
    }
};
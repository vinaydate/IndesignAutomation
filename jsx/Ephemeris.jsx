/**
 * Created by Vinay on 02-Jul-14.
 */
/*global $, alert, Itara */

Ephemeris = {
    prepare: function (data) {
        'use strict';
        Utils.GetPage(app.documents[0], 'Graha 01', true, false, 'A-Master');
        //app.documents[0].pages[0].textFrames[0].contents = data;
    }
};


/**
 * Created by Vinay on 04-Jul-14.
 */

/*global alert, app, LocationOptions, AnchorPoint, CoordinateSpaces*/

Object.prototype.find = function (predicate) {
    'use strict';
    //noinspection JSHint
    if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    //noinspection JSHint
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
        if (i in list) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
    }
    return undefined;
};

//noinspection JSHint
Utils = {

    OverrideFrame: function (page, locatorFrameName, locatorId, check) {
        'use strict';
        var frame = page.textFrames.item(locatorFrameName);
        //noinspection JSHint
        if (frame != null) {
            frame.locked = true;
            return frame;
        }

        if (!check) {
            var mp = page.appliedMaster;
            //noinspection JSHint
            do
            {
                if (!mp) {
                    break;
                }
                frame = mp.textFrames.itemByName(locatorFrameName);
                mp = mp.appliedMaster;
            } while (frame == null && mp);

            //noinspection JSHint
            if (frame == null) {
                throw locatorFrameName + " frame not found on master Page " + mp.name;
            }
            //noinspection JSUnresolvedFunction
            if(page.constructor.name === 'Spread') {
                var pagOfFrame = page.pages[0];
                if(frame.parentPage !== frame.parent.pages[0]){
                    pagOfFrame = page.pages[1];
                }
                frame.override(pagOfFrame);
            }
            else{
                frame.override(page);
            }
            frame = page.textFrames.item(locatorFrameName);
            frame.locked = true;
            return frame;
        }
        alert("Frame " + locatorFrameName + " not found on Page: " + locatorId);
    },
    GetPage: function (document, locator, createIfNot, check, master) {
        'use strict';
        var targetPage = document.spreads.find(function (spread) {
            var locatorFrame = spread.textFrames.item('PageLocator');
            //noinspection JSHint
            if (locatorFrame != null) {
                return locatorFrame.label === locator;
            }
            return false;
        });
        //noinspection JSHint
        if (targetPage != null || !createIfNot) {
            return targetPage;
        }

        var mp = document.masterSpreads.item(master);
        //noinspection JSHint
        if (mp == null) {
            alert("No master page found with name: " + master);
        }
        else{
            targetPage = document.spreads.add(LocationOptions.AFTER, app.layoutWindows[0].activeSpread);
            targetPage.appliedMaster = mp;
        }

        //var rotation = SpreadRotation((MasterSpread)currentPage.AppliedMaster);
        //if(rotation == 90) //ccw
        //   app.MenuActions.ItemByID(6181).Invoke(); //overprint preview
        var origin = targetPage.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
        targetPage.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, origin, targetPage.appliedMaster.transformValuesOf(CoordinateSpaces.PASTEBOARD_COORDINATES)[0]);
        //noinspection JSHint
        var frame = Utils.OverrideFrame(targetPage, "PageLocator", locator, check);
        frame.label = locator;

        //app.documents[0].pages[0].textFrames[0].contents = data;
    }
};


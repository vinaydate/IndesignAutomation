/**
 * Created by Vinay on 04-Jul-14.
 */

/*global alert, app, LocationOptions, AnchorPoint, CoordinateSpaces, Cell*/

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

Object.prototype.reduce = function (callback /*, initialValue*/) {
    'use strict';
    if (null === this || 'undefined' === typeof this) {
        throw new TypeError(
            'Array.prototype.reduce called on null or undefined');
    }
    if ('function' !== typeof callback) {
        throw new TypeError(callback + ' is not a function');
    }
    var t = Object(this), len = t.length >>> 0, k = 0, value;
    if (arguments.length >= 2) {
        value = arguments[1];
    } else {
        while (k < len && !k in t) k++;
        if (k >= len)
            throw new TypeError('Reduce of empty array with no initial value');
        value = t[ k++ ];
    }
    for (; k < len; k++) {
        if (k in t) {
            value = callback(value, t[k], k, t);
        }
    }
    return value;
};

function Fill(toFill, content, overwrite) {
    'use strict';
    if (overwrite == null || overwrite) {
        toFill.contents = "";
    }

    var ip = toFill.insertionPoints[-1];

    if (typeof content === 'string') {
        ip.contents = content;
    }
    if (content.constructor.name === 'Array') {
        for (var cnt = 0; cnt < content.length; cnt++) {
            var item = content[cnt];
            toFill.Fill(item, cnt === 0);
        }
    }
    if (content.constructor.name === 'Majakoora') {
        //noinspection JSHint
        var expectedPs = content.paragraphGroup != null
            ? Globals.WorkDoc.paragraphStyleGroups.item(content.paragraphGroup).paragraphStyles.item(content.paragraphStyle)
            : Globals.WorkDoc.paragraphStyles.item(content.paragraphStyle);
        //noinspection JSHint
        var expectedCs = content.characterGroup != null
            ? Globals.WorkDoc.characterStyleGroups.item(content.characterGroup).characterStyles.item(content.characterStyle)
            : Globals.WorkDoc.characterStyles.item(content.characterStyle);
        //noinspection JSHint
        ip.contents = content.text;
        ip.applyCharacterStyle(expectedCs);
        if (overwrite == null || overwrite) {
            ip.applyParagraphStyle(expectedPs, true);
        }
        else {
            ip.clearOverrides(OverrideType.ALL);
        }
        if (toFill.constructor.name === 'Cell') {
            toFill.appliedCellStyle = Globals.WorkDoc.cellStyles.item(content.cellStyle);
        }
    }

}

Cell.prototype.Fill = function (content, overwrite) {
    Fill(this, content, overwrite);
};

TextFrame.prototype.Fill = function (content, overwrite) {
    Fill(this, content, overwrite);
};

//noinspection JSHint
Utils = {
    pad: function (num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    },

    openDoc: function (name) {
        'use strict';

        if (typeof Globals === 'undefined') {
            //noinspection JSHint
            Globals = {};
        }

        var file = app.documents.item(name);
        //noinspection JSHint
        if (file == null) {
            alert("Need to open file: " + name);
            var m = app.menuActions.item('Open...');
            m.invoke();
            file = app.documents.item('Ephemeris 2016 2025');
        }
        return file;
    },

    Majakoora: function Majakoora(text, pg, ps, cg, cs, cells) {
        'use strict';
        this.paragraphStyle = (ps == null ? "[None]" : ps);
        this.characterStyle = (cs == null ? "[None]" : cs);
        this.paragraphGroup = pg;
        this.characterGroup = cg;
        this.cellStyle = (cells == null ? "[None]" : cells);
        this.text = text;
    },

    Status: function Status(type, message) {
        this.type = type;
        this.message = message;

        /**
         * @return {boolean}
         */
        this.Success = function () {
            return type != null && type == 'Success';
        };

        /**
         * @return {boolean}
         */
        this.Error = function () {
            return type != null && type == 'Error';
        };
    },

    OverrideFrame: function (page, locatorFrameName, pageId, check) {
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
            if (page.constructor.name === 'Spread') {
                var pagOfFrame = page.pages[0];
                if (frame.parentPage !== frame.parent.pages[0]) {
                    pagOfFrame = page.pages[1];
                }
                frame.override(pagOfFrame);
            }
            else {
                frame.override(page);
            }
            frame = page.textFrames.item(locatorFrameName);
            frame.locked = true;
            return frame;
        }
        alert("Frame " + locatorFrameName + " not found on Page: " + pageId);
    },
    GetPage: function (document, locator, createIfNot, check, master, isPage) {
        'use strict';
        var targetCollection = isPage == null || !isPage ? document.spreads : document.pages;
        var targetPage = targetCollection.find(function (spread) {
            var locatorFrame = spread.textFrames.item('PageLocator');
            //noinspection JSHint
            if (locatorFrame != null) {
                return locatorFrame.label === locator;
            }
            return false;
        });
        //noinspection JSHint
        if (targetPage != null || !createIfNot) {
            if (app.activeDocument == document) {
                app.activeWindow = document.layoutWindows[0];
                if (isPage)
                    document.layoutWindows[0].activePage = targetPage;
                else document.layoutWindows[0].activeSpread = targetPage;
            }
            return targetPage;
        }

        var mp = document.masterSpreads.item(master);
        //noinspection JSHint
        if (mp == null) {
            alert("No master page found with name: " + master);
        }
        else {
            targetPage = targetCollection.add(LocationOptions.AFTER, app.layoutWindows[0].activeSpread);
            targetPage.appliedMaster = mp;
            if (app.activeDocument == document) {
                app.activeWindow = document.layoutWindows[0];
                if (isPage)
                    document.layoutWindows[0].activePage = targetPage;
                else document.layoutWindows[0].activeSpread = targetPage;
            }
            var origin = targetPage.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
            targetPage.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, origin, targetPage.appliedMaster.transformValuesOf(CoordinateSpaces.PASTEBOARD_COORDINATES)[0]);
            //noinspection JSHint
            var frame = Utils.OverrideFrame(targetPage, "PageLocator", locator, check);
            frame.label = locator;
            return targetPage;
        }

        //var rotation = SpreadRotation((MasterSpread)currentPage.AppliedMaster);
        //if(rotation == 90) //ccw
        //   app.MenuActions.ItemByID(6181).Invoke(); //overprint preview
        //app.documents[0].pages[0].textFrames[0].contents = data;
    },

    /// <summary>
    /// Makes number of rows to fit in the same height as the table height is right now.
    /// </summary>
    /// <param name="table"></param>
    /// <param name="expectedBodyRows"></param>
    /// <param name="keepLastRow">Some times last row has bottom line defined. In that case keeping last row from re-fitting is necessary. true to keep last row intact.</param>
    FitRows: function (table, expectedBodyRows, keepLastRow) {
        var actualRowCnt = table.bodyRowCount;
        var normalRowsHeight = table.rows[table.headerRowCount + 1].height * actualRowCnt;
        if (!keepLastRow) {
            if (table.bodyRowCount > expectedBodyRows)
                while (table.bodyRowCount > expectedBodyRows)
                    table.rows[table.headerRowCount + table.bodyRowCount - 1].remove();
            else if (table.bodyRowCount < expectedBodyRows)
                while (table.bodyRowCount < expectedBodyRows)
                    table.rows.add(LocationOptions.AFTER, table.rows[table.headerRowCount + table.bodyRowCount - 1]);
        }
        else {
            if (expectedBodyRows < actualRowCnt)
                for (var toDeleteCnt = expectedBodyRows + 1; toDeleteCnt <= actualRowCnt; toDeleteCnt++) //avoid deleting row for krushhna pakshha, cuz it has different border styles
                    table.rows[table.bodyRowCount - 1].remove();
            if (expectedBodyRows > actualRowCnt)
                for (var toAddCnt = actualRowCnt + 1; toAddCnt <= expectedBodyRows; toAddCnt++)
                    table.rows.add(LocationOptions.BEFORE, table.rows[table.rows.Count]);
        }
        for (var i = 1; i <= expectedBodyRows; i++) {
            var row = table.rows[i + table.headerRowCount];
            row.autoGrow = false;
            row.height = normalRowsHeight / expectedBodyRows;
        }
    },

    DeleteEmptyRowsAndFit: function (table, numberOfBodyRows) {
        var actualRowCnt = table.bodyRowCount;
        var normalRowsHeight = table.rows[table.headerRowCount + 1].height * actualRowCnt;
        for (var toDeleteCnt = numberOfBodyRows + 1; toDeleteCnt <= actualRowCnt; toDeleteCnt++)
            table.rows[table.bodyRowCount].remove();
        for (var i = 1; i <= numberOfBodyRows; i++) {
            var row = table.rows[i + table.headerRowCount];
            row.AutoGrow = false;
            row.Height = normalRowsHeight / numberOfBodyRows;
        }
    }
};

Utils.Status.success = function () {
    return new Utils.Status("Success");
};

Utils.Status.error = function (message) {
    return new Utils.Status("Error", message);
};


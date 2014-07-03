/**
 * Created by Vinay on 02-Jul-14.
 */
var IA = IA || {};

IA.Error = function () {
    'use strict';
    this.PageNo = 1;
    this.FrameName = "";
    this.RowId = "";
    this.ColId = "";
    this.Row = 1;
    this.Column = 1;
    this.ErrorIn = "";
    this.Actual = "";
    this.Expected = "";
};
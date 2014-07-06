/**
 * Created by Vinay on 04-Jul-14.
 */
function CopyObject(target, source){
    'use strict';
    for (var prop in source) {
        if (source.hasOwnProperty(prop) && target.hasOwnProperty(prop)) {
            target[prop] = source[prop];
        }
    }
}


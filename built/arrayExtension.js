"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArrayExtension = true;
//除外
Array.prototype.excludes = function (distArray) {
    var srcArray = this, result = [];
    srcArray.forEach(function (element) {
        if (!distArray.includes(element)) {
            result.push(element);
        }
    });
    return result;
};
//去重合并
Array.prototype.distinctConcat = function (distArray) {
    var srcArray = this;
    return Array.from(new Set(srcArray.concat(distArray)));
};
Array.prototype.groupBy = function () {
    var groupKeyArray = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        groupKeyArray[_i] = arguments[_i];
    }
    var scrArray = this;
    if (groupKey.length == 0) {
        return;
    }
    var groupObj = {};
    scrArray.forEach(function (sElm) {
        var groupKey = "";
        groupKeyArray.forEach(function (gElm) {
            groupKey = groupKey + "_" + sElm[gElm];
        });
        if (groupObj[groupKey]) {
            //TODO:Add
            for (var key in sElm) {
                if (typeof sElm[key] === "number") {
                    groupObj[groupKey][key] += sElm[key];
                }
            }
        }
        else {
            groupObj[groupKey] = sElm;
        }
    });
    return;
};
exports.default = ArrayExtension;

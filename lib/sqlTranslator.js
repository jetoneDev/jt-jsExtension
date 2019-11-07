'use strict';
const {
    IsNull
} = require('./valueExtension');
//TODO:去掉Sql异常
//整合insert与excute
//todoAddOption
//valueParams={name:test,id:[1,2,3]}
class SqlTranslator {
    //select，Update，Delete
    execute(sql, valueParams, orderParams) {
        let keyMap = this._createParamsKeyMap(sql);
        if (!keyMap) {
            return sql;
        }
        let orderByMap = this._createOrderByKeyMap(orderParams);

        if (valueParams.constructor === Array) {
            if (typeof valueParams[0] === "object") {
                //Array-Ob
                throw "如果要生产Insert语句，请使用Insert命令，其它不支持";
            } else {
                //Array-nonObj
                this._paramsSqlBuilder(keyMap, valueParams, "in");
            }
        } else {
            //Obj
            this._paramsSqlBuilder(keyMap, valueParams);
        }
        return this._sqlBuilder(sql, keyMap, orderByMap);
    }
    //insert
    insert(sql, params, options) {
        if (!options) {
            options = {
                alias: {},
                extraData: {},
            }
        }
        let result = '';
        let sqlParamArray = sql.match(new RegExp('[(]{1}([@]{1}[a-z0-9A-Z,]+)+[)]{1}', 'gim'))[0].split(',');
        params.forEach((element, index) => {
            let valueStr = "('";
            const valueArray = [];
            for (let i = 0; i < sqlParamArray.length; i++) {
                let paramsName = sqlParamArray[i].replace(new RegExp('[@()]', 'gim'), '');
                //数据是否在源数据里面
                if (paramsName in element) {
                    valueArray.push(element[paramsName]);
                }
                // 数据是否在对照表里面
                else if (!IsNull(options.alias[paramsName])) {
                    valueArray.push(element[options.alias[paramsName]]);
                }
                // 数据源没有的数据(如创建人,创建人Id)
                else if (!IsNull(options.extraData[paramsName])) {
                    valueArray.push(options.extraData[paramsName]);
                }
            }
            valueStr += valueArray.join("','");
            if (index < params.length - 1) {
                valueStr += "'),";
            } else {
                valueStr += "')";
            }
            result += valueStr;
        });
        // maybe has risk
        result = sql.replace(new RegExp('[(]{1}([@]{1}[a-z0-9A-Z,]+)+[)]{1}', 'gim'), result);
        if (global.isDebug) {
            console.log(result)
        }
        return result;
    }
    _paramsSqlBuilder(keyMap, valueParams, type) {
        switch (type) {
            case "in":
                for (const key in keyMap) {
                    keyMap[key] = this._combineWithComma(valueParams);
                }
                break;
            default:
                let formatValueParams = {};
                for (const key in valueParams) {
                    formatValueParams["@" + key.toUpperCase()] = valueParams[key];
                }
                for (const key in keyMap) {
                    if (formatValueParams.hasOwnProperty(key)) {
                        let value = formatValueParams[key];
                        if (value == null || value == undefined) {
                            value = "";
                        }
                        switch (value.constructor.name) {
                            case "Array":
                                keyMap[key] = this._combineWithComma(value);
                                break;
                            case "Number":
                                keyMap[key] = value;
                                break;
                            case "Obj":
                                throw "暂不支持obj.obj的转换";
                            default:
                                keyMap[key] = "'" + value + "'";
                                break;
                        }
                    } else {
                        //noMatch
                        keyMap[key] = key.replace("@", "$");
                    }
                }
                break;

        }
    }
    _sqlBuilder(sql, keyMap, orderByMap) {
        //SqlParams Replace
        for (const key in keyMap) {
            if (keyMap.hasOwnProperty(key)) {
                let value = keyMap[key];
                sql = sql.replace(new RegExp(key, "gim"), value);
            }
        }
        //OrderBy Replace
        for (const key in orderByMap) {
            if (orderByMap.hasOwnProperty(key)) {
                const value = orderByMap[key];
                sql = sql.replace(key, value);
            }
        }
        sql = sql.replace(new RegExp("[$]{1}", "gim"), "@");
        if (global.isDebug) {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>");
            console.log(sql);
        }
        return sql;
    }
    //检测所有@的字段，关键字段的大写对照表，用户更新使用
    _createParamsKeyMap(sql) {
        const regExp = new RegExp('[@]{1}[a-z0-9A-Z]+', 'gim');
        const matcher = sql.match(regExp);
        if (!matcher || matcher.length == 0) {
            return false;
        }
        matcher.sort(function (a, b) {
            return b.length - a.length;
        });
        let map = {};
        matcher.forEach(element => {
            map[element.toUpperCase()] = "";
        });
        return map;
    }
    _combineWithComma(params) {
        if (typeof params[0] === "object") {
            throw "_combineWithComma 不能拼接obj";
        }
        let valueStr = "";
        params.forEach((element, index) => {
            valueStr = valueStr + "'" + element + "'";
            if (index < params.length - 1) {
                valueStr = valueStr + ',';
            }
        });
        return valueStr;
    }
    _createOrderByKeyMap(options) {
        let map = {};
        for (const key in options) {
            if (key.toUpperCase() === "ORDERBY") {
                map["$" + key.toUpperCase()] = options[key];
            }
            if (key.toUpperCase() == "ASC") {
                map["$" + key.toUpperCase()] = options[key] === 1 ? "ASC" : "DESC";
            }
        }
        return map;
    }

}
//TODO: return singleton SqlTranslator
module.exports = new SqlTranslator();
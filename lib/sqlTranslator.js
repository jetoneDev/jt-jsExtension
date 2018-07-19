'use strict';
class SqlTranslator {
    //select，Update，Delete
    execute(sql, valueParams) {
        let keyMap = this._createParamsKeyMap(sql);
        if (!keyMap) {
            return sql;
        }
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
        return this._sqlBuilder(sql, keyMap);
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
        let sqlParamArray = sql.substring(sql.indexOf("(") + 1, sql.indexOf(")")).split(',');
        params.forEach((element, index) => {
            let valueStr = "('";
            const valueArray = [];
            for (let i = 0; i < sqlParamArray.length; i++) {
                //数据是否在源数据里面
                if (sqlParamArray[i] in element) {
                    valueArray.push(element[sqlParamArray[i]]);
                }
                // 数据是否在对照表里面
                else if (options.alias[sqlParamArray[i]]) {
                    valueArray.push(element[options.alias[sqlParamArray[i]]]);
                }
                // 数据源没有的数据(如创建人,创建人Id)
                else if (options.extraData[sqlParamArray[i]]) {
                    valueArray.push(options.extraData[sqlParamArray[i]]);
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
                for (const key in valueParams) {
                    let value = valueParams[key];
                    if (value.constructor == Array) {
                        keyMap["@" + key.toUpperCase()] = this._combineWithComma(value)
                    } else if (typeof value !== "obj") {
                        keyMap["@" + key.toUpperCase()] = "'" + value + "'";
                    } else {
                        throw "暂不支持obj.obj的转换";
                    }
                }
                break;

        }
    }
    _sqlBuilder(sql, keyMap) {
        for (const key in keyMap) {
            if (keyMap.hasOwnProperty(key)) {
                let value = keyMap[key];
                sql = sql.replace(new RegExp(key, "gim"), value);
            }
        }
        if (global.isDebug) {
            console.log(sql)
        }
        return sql;
    }

    _createParamsKeyMap(sql) {
        const regExp = new RegExp('[@]{1}[a-z0-9A-Z]+', 'gim');
        const matcher = sql.match(regExp);
        if (matcher.length == 0) {
            return false;
        }
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
}
//TODO: return singleton SqlTranslator
module.exports = new SqlTranslator();
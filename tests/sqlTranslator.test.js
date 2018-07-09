'use strict'

const translator = require("../lib/sqlTranslator");
const assert = require("assert");
describe('sqlTranslatorTest.js', () => {
    it('select in Test', () => {
        const sql = `select 
    * from table
    where id=@Id and array in (@array) and name=@name
    `
        const a = translator.execute(sql, {
            id: 1,
            array: [1, 2, 3, 4],
            name: '你好'
        });
        console.log('result',a);
    })
})
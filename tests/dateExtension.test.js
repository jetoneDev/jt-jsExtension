const dataExtension = require('../lib/dateExtension')
const assert = require('assert');

describe('dateExtension.test.js', () => {
    it('test dateExtension', () => {
        // let now=new Date();
        // let month = now.getMonth();
        // let day=now.getDay();
        // assert.equal(new Date().getDayStart().toFormatString(), "2018-"+08-15 00:00:00");
        // assert.equal(new Date().getDayStart().toLocaleString(), "2018-8-15 00:00:00");
        // assert.equal(new Date().getDayEnd().toFormatString(), "2018-08-15 23:59:59");
        // assert.equal(new Date().getMonthStart().toFormatString(), "2018-08-01 00:00:00");
        // assert.equal(new Date().getMonthEnd().toFormatString(), "2018-08-31 23:59:59");
        // assert.equal(new Date().getMonthEnd().toFormatString(), "2018-08-31 23:59:59");

        console.log(new Date().addDay(1).toLocaleString())
        console.log(new Date().addDay(-1).toLocaleString())
    });
})
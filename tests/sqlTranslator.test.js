"use strict";

const translator = require("../lib/sqlTranslator");
const assert = require("assert");
describe("sqlTranslatorTest.js", () => {
  it("select in Test", () => {
    const sql = `select 
    * from table
    where id=@Id and array in (@array) and name=@name
    `;
    const a = translator.execute(sql, {
      id: 1,
      array: [1, 2, 3, 4],
      name: "你好"
    });
    console.log("result", a);
  });
  it("insert into Test", () => {
    const sql = `insert into table (a,b,c,d,CreatorId,CreatorName)
        values(@a,@b,@c,@d,@CreatorId,@CreatorName)
    `;
    const a = translator.insert(
      sql,
      [{ l: 5, d: 4, a: 1, c: 3, b: 2 }, { a: 1, l: 5, d: 4, b: 2, c: 3 }],
      {aliasList:{k: "l"},
      extraDatalist:{CreatorId: 2, CreatorName: "clg"} }
    );
    console.log("insert", a);
  });
});

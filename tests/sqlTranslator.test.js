"use strict";

const translator = require("../lib/sqlTranslator");
const assert = require("assert");
function fix(params) {
  return params.replace(/[\s\r\n]/g, "");
}
describe("sqlTranslatorTest.js", () => {
  it("query test1 with Declare", () => {
    const sql = `select @customerCompanyId=(select a from table where id=@id)
    if(@customerCompanyId is null){
       select * from b 
    }`;
    const b = translator.execute(sql, {
      id: 1
    });
    assert.equal(fix(b), fix(`
    select @CUSTOMERCOMPANYID=(select a from table where id=1)
        if(@CUSTOMERCOMPANYID is null){
           select * from b 
        }`));
  })

  it("query test2 with Declare", () => {
    const sql = `
    declare @CustomerTypeId int
    insert Into log (stringValue,nullValue,unValue,numberValue,CustomerType)
    values(@stringValue,@nullValue,@unValue,@numberValue,@CustomerType)`
    const b = translator.execute(sql, {
      stringValue: "string",
      nullValue: null,
      unValue: undefined,
      numberValue: 0,
      CustomerType: 'Type',
    })
    assert.equal(fix(b), fix(`declare @CUSTOMERTYPEID int
    insert Into log (stringValue,nullValue,unValue,numberValue,CustomerType)
    values('string','','',0,'Type')`));
  })

  it("query test3 with in", () => {
    const sql = `select 
    * from table
    where id=@Id and array in (@array) and name=@name
    `;
    const a = translator.execute(sql, {
      id: 1,
      array: [1, 2, 3, 4],
      name: "你好"
    });
    assert.equal(fix(a), fix(`select 
    * from table
    where id=1 and array in ('1','2','3','4') and name='你好'`));
  });

  it("query test4 with orderByParams", () => {
    const sql = `select 
    * from table
    where id=@Id and array in (@array) and name=@name order by @OrderBy @Asc
    `;
    const a = translator.execute(sql, {
      id: 1,
      array: [1, 2, 3, 4],
      name: "你好"
    }, { OrderBy: "id", "Asc": 0 });
    assert.equal(fix(a), fix(`select 
    * from table
    where id=1 and array in ('1','2','3','4') and name='你好' order by id DESC
    `));
  });
  it("insert test1", () => {
    const sql = `INSERT INTO MaterialSheet (TaskId,Type,CreatorId,CreatorName,Status,CompanyId,Warehouse)
    VALUES (@TaskId,@Type,@CreatorId,@CreatorName,@Status,@CompanyId,@MaterialWarehouseEngineer)
    SELECT SCOPE_IDENTITY() AS id `;
    const a = translator.insert(
      sql, [{
        TaskId: 1,
        Type: 2,
        CreatorId: 3,
        CreatorName: 4,
        Status: 5,
        CompanyId: 6,
        MaterialWarehouseEngineer: 7,
      }]
    );
    assert.equal(fix(a), fix(`INSERT INTO MaterialSheet (TaskId,Type,CreatorId,CreatorName,Status,CompanyId,Warehouse)
    VALUES ('1','2','3','4','5','6','7')
    SELECT SCOPE_IDENTITY() AS id `));
  });
  it("insert test2 with 2 similar params name", () => {
    const sql = `insert Into log (CreatorId,CreatorName,OperationMessage,TableName,OperationMessageId,CompanyId)
values(@CreatorId,@CreatorName,@OperationMessage,@TableName,@OperationMessageId,@CompanyId)`
    const b = translator.execute(sql, {
      CreatorId: 1,
      CreatorName: 'jack',
      OperationMessage: 'A|b|C',
      tableName: 'aB|c',
      OperationMessageId: '12',
      companyId: null
    })
    assert.equal(fix(b), fix(`insert Into log (CreatorId,CreatorName,OperationMessage,TableName,OperationMessageId,CompanyId)
    values(1,'jack','A|b|C','aB|c','12','')`));
  })
  it("insert test1 aliasList extraDataList  ", () => {
    const sql = `insert into table (text,CreatorId,CreatorName)
        values(@text,@CreatorId,@CreatorName)
    `;
    const a = translator.insert(
      sql, [{
        text1: "1",
      }, {
        text1: "2"
      }], {
        alias: {
          text: "text1"
        },
        extraData: {
          CreatorId: 2,
          CreatorName: "clg"
        }
      }
    );
    assert.equal(fix(a), fix(`insert into table (text,CreatorId,CreatorName)
        values('1','2','clg'),('2','2','clg')
    `));
  });
  it("insert test2 with  extraDataList is 0", () => {
    const insertTaskEngineerSql = `insert into dbo.taskEngineer(EngineerId,TaskId,TaskStatus,CreatorId,CreatorName)
    values (@EngineerId,@TaskId,@TaskStatus,@CreatorId,@CreatorName)`;
    const a = translator.insert(insertTaskEngineerSql, [{ EngineerId: 1 }],
      {
        alias: {
        },
        extraData: {
          TaskId: 1,
          TaskStatus: 0,
          CreatorId: 2,
          CreatorName: "clg",
        },
      });
    assert.equal(fix(a), fix(`insert into dbo.taskEngineer(EngineerId,TaskId,TaskStatus,CreatorId,CreatorName)
    values ('1','1','0','2','clg')`));
  })
});
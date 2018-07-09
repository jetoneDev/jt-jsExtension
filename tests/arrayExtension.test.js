const assert = require("assert");
const arrayExtension = require("../lib/arrayExtension");
describe("arrayExtensionTest.js", () => {
  it("groupBy", () => {
    let array = [{
        name: 'A',
        score: 1
      },
      {
        name: 'B',
        score: -1
      },
      {
        name: 'A',
        score: 1
      },
      {
        name: 'B',
        score: 1
      },
    ]
    const result = array.groupBy("name");
    assert(result.length === 2);
    assert(result[0].name === 'A' && result[0].score === 2);
    assert(result[1].name === 'B' && result[1].score === 0);
  });
});
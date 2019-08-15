import { IPostgresController, KeyValueResult, PostgresController } from "../postgres";

describe("PostgresController", () => {

  let collName: string;
  let controller: IPostgresController;
  const keys = "keys";
  const values = "values";
  const escapes = "escapes";
  const keyValueResult: KeyValueResult = {
    escapes: ["$1", "$2", "$3"],
    keys: [keys, values, escapes],
    values: [keys, values, escapes],
  };

  beforeAll(() => {
    collName = "test";
    controller = new PostgresController(collName);
  });

  beforeEach(() => {
    controller = new PostgresController(collName);
  });

  it("splitObjectKeyVals", () => {
    const obj = { keys, values, escapes };
    const result = controller.splitObjectKeyVals(obj);
    expect(result).toEqual(keyValueResult);
  });

  it("buildQueryByID", () => {
    expect(controller.buildQueryByID(keys, values)).toEqual(`${keys} = ${values}`);
  });

  it("buildUpdateString", () => {
    expect(controller.buildUpdateString([keys, values, escapes])).toEqual({
      idx: 4,
      query: `${keys} = $1, ${values} = $2, ${escapes} = $3`,
    });
  });

});

process.env.PORT = 0; // Use random ports during tests

const { ServiceBroker } = require("moleculer");
const ApiGateway = require("moleculer-web");

const Openapi = require("../index");

const OpenapiService = {
  mixins: [Openapi],
  settings: {
    openapi: {
      "info": {
        "description": "Foo",
        "title": "Bar",
      },
    },
  },
};

const SomeService = {
  name: "some",
  actions: {
    contacttest: {
      params: {
        name: 'string'
      },
      openapi: {
        responses: {
          200: {
            "interface": "Test"
          }
        }
      },
      handler() {}
    },
    contacttesttwo: {
      params: {
        name: 'string',
        users: { 
          type: "array", 
          items: {
            type: "object", 
            props: {
              id: { type: "number", positive: true },
              name: { type: "string", empty: false },
              status: "boolean"
            }
          } 
        }
      },
      openapi: {
        responses: {
          200: {
            "interface": "Test2"
          }
        }
      },
      handler() {}
    },
    contact: {
      params: {
        name: 'string'
      },
      openapi: {
        responses: {
          200: {
            "interface": "Contact"
          }
        }
      },
      handler() {}
    },
    upload: {
      openapi: {
        responses: {
          200: {
            "type": { 
              id: 'number', 
              filename: 'string', 
              mimetype: 'string', 
              sizeInBytes: 'boolean|optional',
              arrayTest: {
                type: 'array',
                items: 'string'
              },
              objTest: {
                type: "object",
                props: {
                  id: 'string',
                  test: 'number'
                }
              }
            },
          },
          400: {
            $ref: "#/components/responses/FileNotExist",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          413: {
            $ref: "#/components/responses/FileTooBig",
          },
          422: {
            $ref: "#/components/responses/ValidationError",
          },
          default: {
            $ref: "#/components/responses/ServerError",
          },
        },
      },
      handler() {},
    },
    update: {
      openapi: {
        summary: "Foo bar baz",
      },
      params: {
        $$strict: "remove",
        roles: { type: "array", items: "string", enum: [ "user", "admin" ] },
        sex: { type: "enum", values: ["male", "female"], default: "female" },
        id: { type: "number", convert: true, default: 5 },
        numberBy: "number",
        someNum: { $$t: "Is some num", type: "number", convert: true },
        types: {
          type: "array",
          $$t: "Types arr",
          default: [{ id: 1, typeId: 5 }],
          length: 1,
          items: {
            type: "object", strict: "remove", props: {
              id: { type: "number", optional: true },
              typeId: { type: "number", optional: true },
            },
          },
        },
        bars: {
          type: "array",
          $$t: "Bars arr",
          min: 1,
          max: 2,
          items: {
            type: "object", strict: "remove", props: {
              id: { type: "number", optional: true },
              fooNum: { $$t: "fooNum", type: "number", optional: true },
            },
          },
        },
        someObj: {
          $$t: "Some obj",
          default: { name: "bar" },
          type: "object", strict: "remove", props: {
            id: { $$t: "Some obj ID", type: "number", optional: true },
            numberId: { type: "number", optional: true },
            name: { type: "string", optional: true, max: 100 },
          },
        },
        someBool: { type: "boolean", optional: true },
        desc: { type: "string", optional: true, max: 10, min: 4, },
        email: "email",
        date: "date|optional|min:0|max:99",
        uuid: "uuid",
        url: "url",
        shortObject: {
          $$type: "object",
          desc: { type: "string", optional: true, max: 10000 },
          url: "url",
        },
        shortObject2: {
          $$type: "object|optional",
          desc: { type: "string", optional: true, max: 10000 },
          url: "url",
        }
      },
      handler() {},
    },
    /**
     * Action from moleculer-db mixin
     */
    find: {
      cache: {
        keys: ["populate", "fields", "limit", "offset", "sort", "search", "searchFields", "query"],
      },
      params: {
        roles: { type: "array", items: "string", enum: [ "user", "admin" ] },
        sex: { type: "enum", values: ["male", "female"] },
        populate: [
          { type: "string", optional: true },
          { type: "array", optional: true, items: "string" },
        ],
        fields: [
          { type: "string", optional: true },
          { type: "array", optional: true, items: "string" },
        ],
        limit: { type: "number", integer: true, min: 0, optional: true, convert: true },
        offset: { type: "number", integer: true, min: 0, optional: true, convert: true },
        sort: { type: "string", optional: true },
        search: { type: "string", optional: true, default: "find me now" },
        searchFields: [
          { type: "string", optional: true },
          { type: "array", optional: true, items: "string" },
        ],
        query: [
          { type: "object", optional: true },
          { type: "string", optional: true },
        ],
      },
      handler() {},
    },
    go: {
      openapi: {
        responses: {
          200: {
            "description": ``,
            "content": {
              "application/json": {
                "schema": {
                  "type": `object`,
                  "example": { line: `number`, text: `string` },
                },
              },
            },
          },
        },
      },
      params: {
        line: { type: `number` },
      },
      handler() {},
    }
  },
};

const ApiService = {
  name: "api",
  mixins: [ApiGateway],
  settings: {
    routes: [
      {
        path: "/api",
        aliases: {
          "POST login-custom-function": {
            handler(req, res) {
              res.end();
            },
            openapi: {
              summary: "Login",
              tags: ["auth"],
              requestBody: {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      example: { login: "", pass: "" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        path: "/api",
        aliases: {
          "GET contact": "some.contact",
          "GET contact2": "some.contacttest",
          "POST contact3": "some.contacttesttwo",
          "PUT upload": "multipart:some.upload",
          "PATCH update/:id": "some.update",
          "GET find": {
            openapi: {
              summary: "Some find summary",
            },
            action: "some.find",
          },
          "POST go": "some.go",
        },
      },
      {
        path: "/api",
        whitelist: ["openapi.*"],
        autoAliases: true,
      },
    ],
  },
};

describe("Test 'openapi' mixin", () => {
  const broker = new ServiceBroker({ logger: false });
  broker.createService(SomeService);
  broker.createService(OpenapiService);
  broker.createService(ApiService);

  beforeAll(async () => {
    await broker.start();

    // wait for all services auto resolved
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterAll(() => broker.stop());

  it("generate schema json file", async () => {
    expect.assertions(1);

    const json = await broker.call("openapi.generateDocs");

    const expectedSchema = require("./expectedSchema.json");

    // check json https://editor.swagger.io/
    //console.log(JSON.stringify(json, null, ""));
    expect(json).toMatchObject(expectedSchema);
  });
});

# moleculer-auto-openapi

## Usage
Create openapi.service.js with content:
```javascript
const Openapi = require("moleculer-auto-openapi");

module.exports = {
  name: 'openapi',
  mixins: [Openapi],
  settings: {
    // all setting optional
    openapi: {
      "info": {
        // about project
        "description": "Foo",
        "title": "Bar",
      },
      tags: [
        // you tags
        { name: "auth", description: "My custom name" },
      ],
      components: {
        // you auth
        securitySchemes: {
          myBasicAuth: {
            type: 'http',
            scheme: 'basic',
          },
        },
      },
    },
  },
}
```

Describe params:
```javascript
module.exports = {
    actions:{
        update: {
          openapi: {
            summary: "Foo bar baz",
            security: [{ "myBasicAuth": [] }],
          },
          params: {
            $$strict: "remove",
            id: { type: "number", convert: true },
            numberBy: "number",
            someNum: { $$t: "Is some num", type: "number", convert: true },
            types: {
              type: "array",
              $$t: "Types arr",
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
              items: {
                type: "object", strict: "remove", props: {
                  id: { type: "number", optional: true },
                  fooNum: { $$t: "fooNum", type: "number", optional: true },
                },
              },
            },
            someObj: {
              $$t: "Some obj",
              type: "object", strict: "remove", props: {
                id: { $$t: "Some obj ID", type: "number", optional: true },
                numberId: { type: "number", optional: true },
                name: { type: "string", optional: true, max: 100 },
              },
            },
            someBool: { type: "boolean", optional: true },
            desc: { type: "string", optional: true, max: 10000 },
          },
          handler() {},
        },
    }
}
```
end etc. See test/openapi.mixin.spec.js for examples

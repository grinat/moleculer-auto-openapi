# moleculer-auto-openapi
Auto generate openapi(swagger) scheme for molecular.
Scheme generated based on action validation params, routes on all avalaibled services and paths in ApiGateway.

## Install
```shell script
npm i moleculer-auto-openapi --save
```

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
      info: {
        // about project
        description: "Foo",
        title: "Bar",
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
And add resolvers to your webapi service:
```javascript
module.exports = {
  name: `api`,
  mixins: [ApiGateway],
  settings: {
    routes: [
      // moleculer-auto-openapi routes
      {
        path: '/api/openapi',
        aliases: {
          'GET /openapi.json': 'openapi.generateDocs', // swagger scheme
          'GET /ui': 'openapi.ui', // ui
          'GET /assets/:file': 'openapi.assets', // js/css files
        },
      },
    ],
  },
};
```

Describe params in service:
```javascript
module.exports = {
  actions: {
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
        },
        password: { type: 'string', min: 8, pattern: /^[a-zA-Z0-9]+$/ },
        password2: { type: 'string', min: 8, pattern: '^[a-zA-Z0-9]+$' }
      },
      handler() {},
    },
  },
}
```
end etc. See test/openapi.mixin.spec.js for examples

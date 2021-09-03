const UNRESOLVED_ACTION_NAME = "unknown-action";

const NODE_TYPES = {
  boolean: "boolean",
  number: "number",
  date: "date",
  uuid: "uuid",
  email: "email",
  url: "url",
  string: "string",
  enum: "enum",
}

/*
* Inspired by https://github.com/icebob/kantab/blob/fd8cfe38d0e159937f4e3f2f5857c111cadedf44/backend/mixins/openapi.mixin.js
 */
module.exports = {
  name: `openapi`,
  settings: {
    port: process.env.PORT || 3000,
    onlyLocal: false, // build schema from only local services
    schemaPath: "/api/openapi/openapi.json",
    uiPath: "/api/openapi/ui",
    requestBodyAndResponseBodyAreSameOnMethods: [
      /* 'post',
      'patch',
      'put', */
    ],
    requestBodyAndResponseBodyAreSameDescription: "The answer may vary slightly from what is indicated here. Contain id and/or other additional attributes.",
    openapi: {
      "openapi": "3.0.3",
      "info": {
        "description": "",
        "version": "0.0.0",
        "title": "Api docs",
      },
      "tags": [],
      "paths": {},
      "components": {
        "schemas": {
          // Standart moleculer schemas
          "DbMixinList": {
            "type": "object",
            "properties": {
              "rows": {
                "type": "array",
                "items": {
                  "type": "object",
                },
              },
              "totalCount": {
                "type": "number",
              },
            },
          },
          "DbMixinFindList": {
            "type": "array",
            "items": {
              "type": "object",
            },
          },
          "Item": {
            "type": "object",
          },
        },
        "securitySchemes": {},
        "responses": {
          // Standart moleculer responses
          "ServerError": {
            "description": "Server errors: 500, 501, 400, 404 and etc...",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": { "name": "MoleculerClientError", "message": "Server error message", "code": 500 },
                },
              },
            },
          },
          "UnauthorizedError": {
            "description": "Need auth",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": { "name": "MoleculerClientError", "message": "Unauth error message", "code": 401 },
                },
              },
            },
          },
          "ValidationError": {
            "description": "Fields invalid",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "name": "MoleculerClientError", "message": "Error message", "code": 422, "data": [
                      { "name": "fieldName", "message": "Field invalid" },
                      { "name": "arrayField[0].fieldName", "message": "Whats wrong" },
                      { "name": "object.fieldName", "message": "Whats wrong" },
                    ],
                  },
                },
              },
            },
          },
          "ReturnedData": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "oneOf": [
                    {
                      "$ref": "#/components/schemas/DbMixinList",
                    },
                    {
                      "$ref": "#/components/schemas/DbMixinFindList",
                    },
                    {
                      "$ref": "#/components/schemas/Item",
                    },
                  ],
                },
              },
            },
          },
          "FileNotExist": {
            "description": "File not exist",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "name": "MoleculerClientError",
                    "message": "File missing in the request",
                    "code": 400,
                  },
                },
              },
            },
          },
          "FileTooBig": {
            "description": "File too big",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "name": "PayloadTooLarge",
                    "message": "Payload too large",
                    "code": 413,
                    "type": "PAYLOAD_TOO_LARGE",
                    "data": {
                      "fieldname": "file",
                      "filename": "4b2005c0b8.png",
                      "encoding": "7bit",
                      "mimetype": "image/png",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  actions: {
    generateDocs: {
      openapi: {
        // you can declare custom Path Item Object
        // which override autogenerated object from params
        // https://github.com/OAI/OpenAPI-Specification/blob/b748a884fa4571ffb6dd6ed9a4d20e38e41a878c/versions/3.0.3.md#path-item-object-example
        summary: "OpenAPI schema url",

        // you custom response
        // https://github.com/OAI/OpenAPI-Specification/blob/b748a884fa4571ffb6dd6ed9a4d20e38e41a878c/versions/3.0.3.md#response-object-examples
        responses: {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/OpenAPIModel",
                },
              },
            },
          },
        },

        // you custom tag
        // https://github.com/OAI/OpenAPI-Specification/blob/b748a884fa4571ffb6dd6ed9a4d20e38e41a878c/versions/3.0.3.md#fixed-fields-8
        tags: ["openapi"],

        // components which attached to root of docx
        // https://github.com/OAI/OpenAPI-Specification/blob/b748a884fa4571ffb6dd6ed9a4d20e38e41a878c/versions/3.0.3.md#components-object
        components: {
          schemas: {
            // you custom schema
            // https://github.com/OAI/OpenAPI-Specification/blob/b748a884fa4571ffb6dd6ed9a4d20e38e41a878c/versions/3.0.3.md#models-with-polymorphism-support
            OpenAPIModel: {
              type: "object",
              properties: {
                openapi: {
                  example: "3.0.3",
                  type: "string",
                  description: "OpenAPI version",
                },
                info: {
                  type: "object",
                  properties: {
                    description: {
                      type: "string",
                    },
                  },
                },
                tags: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
              required: ["openapi"],
            },
          },
        },
      },
      handler() {
        return this.generateSchema();
      },
    },
    ui: {
      openapi: {
        summary: "OpenAPI ui",
        description: "You can provide any schema file in query param",
      },
      params: {
        url: { $$t: "Schema url", type: "string", optional: true },
      },
      handler(ctx) {
        ctx.meta.$responseType = "text/html";
        ctx.meta.$responseHeaders = {
          "Content-Security-Policy": `default-src 'self' unpkg.com; img-src 'self' data:; script-src-elem 'self' 'unsafe-inline' unpkg.com`
        }
        const version = '3.38.0';

        return `
      <html>
        <head>
           <title>OpenAPI UI</title>
           <link rel="stylesheet" href="//unpkg.com/swagger-ui-dist@${version}/swagger-ui.css"/>
        </head>
        <body>

          <div id="swagger-ui">
            <p>Loading...</p>
            <noscript>If you see json, you need to update your moleculer-web to 0.8.0 and moleculer to 0.12</noscript>
          </div>

          <script src="//unpkg.com/swagger-ui-dist@${version}/swagger-ui-bundle.js"></script>
          <script src="//unpkg.com/swagger-ui-dist@${version}/swagger-ui-standalone-preset.js"></script>
          <script>
            window.onload = function() {
             SwaggerUIBundle({
               url: "${ctx.params.url || this.settings.schemaPath}",
               dom_id: '#swagger-ui',
               deepLinking: true,
               presets: [
                 SwaggerUIBundle.presets.apis,
                 SwaggerUIStandalonePreset,
               ],
               plugins: [
                 SwaggerUIBundle.plugins.DownloadUrl
               ],
               layout: "StandaloneLayout",
             });
            }
          </script>

        </body>
      </html>`;
      },
    },
  },
  methods: {
    fetchServicesWithActions() {
      return this.broker.call("$node.services", {
        withActions: true,
        onlyLocal: this.settings.onlyLocal,
      });
    },
    fetchAliasesForService(service) {
      return this.broker.call(`${service}.listAliases`);
    },
    async generateSchema() {
      const generateInterfaces = require('./interface2json');
      this.interfaces = await generateInterfaces();
      const doc = JSON.parse(JSON.stringify(this.settings.openapi));

      const nodes = await this.fetchServicesWithActions();

      const routes = await this.collectRoutes(nodes);

      this.attachParamsAndOpenapiFromEveryActionToRoutes(routes, nodes);

      this.attachRoutesToDoc(routes, doc);

      return doc;
    },
    attachParamsAndOpenapiFromEveryActionToRoutes(routes, nodes) {
      for (const routeAction in routes) {
        for (const node of nodes) {
          for (const nodeAction in node.actions) {
            if (routeAction === nodeAction) {
              const actionProps = node.actions[nodeAction];

              routes[routeAction].params = actionProps.params || {};
              routes[routeAction].openapi = actionProps.openapi || null;
              break;
            }
          }
        }
      }
    },
    async collectRoutes(nodes) {
      const routes = {};

      for (const node of nodes) {
        // find routes in web-api service
        if (node.settings && node.settings.routes) {

          // iterate each route
          for (const route of node.settings.routes) {
            // map standart aliases
            this.buildActionRouteStructFromAliases(route, routes);
          }

          // resolve paths with auto aliases
          const hasAutoAliases = node.settings.routes.some(route => route.autoAliases);
          if (hasAutoAliases) {
            const autoAliases = await this.fetchAliasesForService(node.name);
            const convertedRoute = this.convertAutoAliasesToRoute(autoAliases);
            this.buildActionRouteStructFromAliases(convertedRoute, routes);
          }
        }
      }

      return routes;
    },
    /**
     * @link https://github.com/moleculerjs/moleculer-web/blob/155ccf1d3cb755dafd434e84eb95e35ee324a26d/src/index.js#L229
     * @param autoAliases<Array{Object}>
     * @returns {{path: string, aliases: {}}}
     */
    convertAutoAliasesToRoute(autoAliases) {
      const route = {
        path: '',
        autoAliases: true,
        aliases: {},
      };

      for (const obj of autoAliases) {
        const alias = `${obj.methods} ${obj.fullPath}`;
        route.aliases[alias] = obj.actionName || UNRESOLVED_ACTION_NAME;
      }

      return route;
    },
    /**
     * convert `GET /table`: `table.get`
     * to {action: {
     *   actionType:'multipart|null',
     *   params: {},
     *   autoAliases: true|undefined
     *   paths: [
     *    {base: 'api/uploads', alias: 'GET /table'}
     *   ]
     *   openapi: null
     * }}
     * @param route
     * @param routes
     * @returns {{}}
     */
    buildActionRouteStructFromAliases(route, routes) {
      for (const alias in route.aliases) {
        const aliasInfo = route.aliases[alias];
        let actionType = aliasInfo.type;

        let action = "";
        if (aliasInfo.action) {
          action = aliasInfo.action;
        } else if (typeof aliasInfo !== "string") {
          action = UNRESOLVED_ACTION_NAME;
        } else {
          action = aliasInfo;
        }
        // support actions like multipart:import.proceedFile
        if (action.includes(":")) {
          ([actionType, action] = action.split(":"));
        }

        if (!routes[action]) {
          routes[action] = {
            actionType,
            params: {},
            paths: [],
            openapi: null,
          };
        }

        routes[action].paths.push({
          base: route.path || "",
          alias,
          autoAliases: route.autoAliases,
          openapi: aliasInfo.openapi || null,
        });
      }

      return routes;
    },
    attachRoutesToDoc(routes, doc) {
      // route to openapi paths
      for (const action in routes) {
        const { paths, params, actionType, openapi = {} } = routes[action];
        const service = action.split(".").slice(0, -1).join(".");

        this.addTagToDoc(doc, service);

        for (const path of paths) {
          // parse method and path from: POST /api/table
          const [tmpMethod, subPath] = path.alias.split(" ");
          const method = tmpMethod.toLowerCase();

          // convert /:table to /{table}
          const openapiPath = this.formatParamUrl(
            this.normalizePath(`${path.base}/${subPath}`),
          );

          const [queryParams, addedQueryParams] = this.extractParamsFromUrl(openapiPath);

          if (!doc.paths[openapiPath]) {
            doc.paths[openapiPath] = {};
          }

          if (doc.paths[openapiPath][method]) {
            continue;
          }

          // Path Item Object
          // https://github.com/OAI/OpenAPI-Specification/blob/b748a884fa4571ffb6dd6ed9a4d20e38e41a878c/versions/3.0.3.md#path-item-object-example
          doc.paths[openapiPath][method] = {
            summary: "",
            tags: [service],
            // rawParams: params,
            parameters: [...queryParams],
            responses: {
              // attach common responses
              200: {
                $ref: "#/components/responses/ReturnedData",
              },
              401: {
                $ref: "#/components/responses/UnauthorizedError",
              },
              422: {
                $ref: "#/components/responses/ValidationError",
              },
              default: {
                $ref: "#/components/responses/ServerError",
              },
            },
          };

          const schemaName = action;

          if (method === "get" || method === "delete") {
            doc.paths[openapiPath][method].parameters.push(
              ...this.moleculerParamsToQuery(params, addedQueryParams),
            );
          } else {
            this.createSchemaFromParams(doc, schemaName, params, addedQueryParams);
            doc.paths[openapiPath][method].requestBody = {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": `#/components/schemas/${schemaName}`,
                  },
                },
              },
            };
          }

          if (this.settings.requestBodyAndResponseBodyAreSameOnMethods.includes(method)) {
            doc.paths[openapiPath][method].responses[200] = {
              "description": this.settings.requestBodyAndResponseBodyAreSameDescription,
              ...doc.paths[openapiPath][method].requestBody,
            };
          }

          // if multipart/stream convert fo formData/binary
          if (actionType === "multipart" || actionType === "stream") {
            doc.paths[openapiPath][method] = {
              ...doc.paths[openapiPath][method],
              parameters: [...queryParams],
              requestBody: {
                content: {
                  ...(actionType === "multipart" ? {
                    "multipart/form-data": {
                      schema: {
                        type: "object",
                        properties: {
                          file: {
                            type: "array",
                            items: {
                              type: "string",
                              format: "binary"
                            },
                          },
                          someField: {
                            type: "string"
                          }
                        },
                      },
                    },
                  } : {
                    "application/octet-stream": {
                      schema: {
                        type: "string",
                        format: "binary",
                      },
                    },
                  }),
                },
              },
            };
          }

          if(openapi && openapi.responses) {
            const statusCodes = Object.keys(openapi.responses);
            statusCodes.forEach(statusCode => {
              const responseKeys = Object.keys(openapi.responses[statusCode]);
              if(!responseKeys.includes('type') && !responseKeys.includes('interface')) {
                return;
              }
              if(responseKeys.includes('interface')) {
                openapi.responses[statusCode].type = this.interfaces[openapi.responses[statusCode].interface];
                delete openapi.responses[statusCode].interface;
                if(!openapi.responses[statusCode].type) {
                  return console.error('type not found in generated interfaces');
                }
              }
              this.createSchemasFromResponses(doc, schemaName, statusCode, openapi.responses[statusCode].type);
              doc.paths[openapiPath][method].responses = {
                ...doc.paths[openapiPath][method].responses,
                [statusCode] : {
                  "description": openapi.responses[statusCode].description || '',
                  "content": {
                    "application/json": {
                      "schema": {
                        "$ref": `#/components/schemas/${schemaName}.response${statusCode}`
                      }
                    }
                  }
                }
              }
            });
          }
          
          // merge values from action
          doc.paths[openapiPath][method] = this.mergePathItemObjects(
            doc.paths[openapiPath][method],
            openapi,
          );

          // merge values which exist in web-api service
          // in routes or custom function
          doc.paths[openapiPath][method] = this.mergePathItemObjects(
            doc.paths[openapiPath][method],
            path.openapi,
          );

          // add tags to root of scheme
          if (doc.paths[openapiPath][method].tags) {
            doc.paths[openapiPath][method].tags.forEach(name => {
              this.addTagToDoc(doc, name);
            });
          }

          // add components to root of scheme
          if (doc.paths[openapiPath][method].components) {
            doc.components = this.mergeObjects(
              doc.components,
              doc.paths[openapiPath][method].components,
            );
            delete doc.paths[openapiPath][method].components;
          }

          doc.paths[openapiPath][method].summary = `
            ${doc.paths[openapiPath][method].summary}
            (${action})
            ${path.autoAliases ? '[autoAlias]' : ''}
          `.trim();
        }
      }
    },
    addTagToDoc(doc, tagName) {
      const exist = doc.tags.some(v => v.name === tagName);
      if (!exist && tagName) {
        doc.tags.push({
          name: tagName,
        });
      }
    },
    /**
     * Convert moleculer params to openapi query params
     * @param obj
     * @param exclude{Array<string>}
     * @returns {[]}
     */
    moleculerParamsToQuery(obj = {}, exclude = []) {
      const out = [];

      for (const fieldName in obj) {
        // skip system field in validator scheme
        if (fieldName.startsWith("$$")) {
          continue;
        }
        if (exclude.includes(fieldName)) {
          continue;
        }

        const node = obj[fieldName];

        // array nodes
        if (Array.isArray(node) || (node.type && node.type === "array")) {
          const item = {
            "name": `${fieldName}[]`,
            "description": node.$$t,
            "in": "query",
            "schema": {
              "type": "array",
              "items": this.getTypeAndExample({
                default: node.default,
                enum: node.enum,
                type: node.items,
              }),
              unique: node.unique,
              minItems: node.length || node.min,
              maxItems: node.length || node.max,
            },
          };
          out.push(item);
          continue;
        }

        // string/number/boolean
        out.push({
          "in": "query",
          "name": fieldName,
          "description": node.$$t,
          "schema": this.getTypeAndExample(node),
        });
      }

      return out;
    },
    createSchemasFromResponses(doc, schemeName, statusCode, obj, exclude = [], parentNode = {}) {
      const def = {
        "type": "object",
        "properties": {},
        "required": [],
        default: parentNode.default,
      };
      
      if(statusCode) {
        doc.components.schemas[`${schemeName}.response${statusCode}`] = def;
      } else {
        doc.components.schemas[schemeName] = def;
      }
      
      for (const fieldName in obj) {
        // arr or object desc
        if (fieldName === "$$t") {
          def.description = obj[fieldName];
        }

        let node = obj[fieldName];
        const nextSchemeName = `${schemeName}.${fieldName}`;

        if (
          // expand $$type: "object|optional"
          node && node.$$type && node.$$type.includes('object')
        ) {
          node = {
            type: 'object',
            optional: node.$$type.includes('optional'),
            $$t: node.$$t || '',
            props: {
              ...node,
            }
          }
        } else if (
          // skip system field in validator scheme
          fieldName.startsWith("$$")
        ) {
          continue;
        }

        if (exclude.includes(fieldName)) {
          continue;
        }

        // expand from short rule to full
        if (!(node && node.type)) {
          node = this.expandShortDefinition(node);
        }

        // mark as required
        if (node.type === "array") {
          if (node.min || node.length || node.max) {
            def.required.push(fieldName);
            def.minItems = node.length || node.min;
            def.maxItems = node.length || node.max;
          }
          def.unique = node.unique;
        } else if (!node.optional) {
          def.required.push(fieldName);
        }

        // common props
        def.properties[fieldName] = {
          description: node.$$t,
        };

        if (node.type === "object") {
          def.properties[fieldName] = {
            ...def.properties[fieldName],
            $ref: `#/components/schemas/${nextSchemeName}`,
          };
          this.createSchemasFromResponses(doc, nextSchemeName, null, node.props, [], node);
          continue;
        }

        // array with objects
        if (node.type === "array" && node.items && node.items.type === "object") {
          def.properties[fieldName] = {
            ...def.properties[fieldName],
            type: "array",
            default: node.default,
            unique: node.unique,
            minItems: node.length || node.min,
            maxItems: node.length || node.max,
            items: {
              $ref: `#/components/schemas/${nextSchemeName}`,
            },
          };
          this.createSchemasFromResponses(doc, nextSchemeName, null, node.items.props, [], node);
          continue;
        }

        // simple array
        if (node.type === "array") {
          def.properties[fieldName] = {
            ...def.properties[fieldName],
            type: "array",
            items: this.getTypeAndExample({
              default: node.default,
              enum: node.enum,
              type: node.items,
            }),
            unique: node.unique,
            minItems: node.length || node.min,
            maxItems: node.length || node.max,
          };
          continue;
        }

        // string/number/boolean
        def.properties[fieldName] = {
          ...def.properties[fieldName],
          ...this.getTypeAndExample(node),
        };
      }

      if (def.required.length === 0) {
        delete def.required;
      }
    },
    /**
     * Convert moleculer params to openapi definitions(components schemas)
     * @param doc
     * @param schemeName
     * @param obj
     * @param exclude{Array<string>}
     * @param parentNode
     */
    createSchemaFromParams(doc, schemeName, obj, exclude = [], parentNode = {}) {
      // Schema model
      // https://github.com/OAI/OpenAPI-Specification/blob/b748a884fa4571ffb6dd6ed9a4d20e38e41a878c/versions/3.0.3.md#models-with-polymorphism-support
      const def = {
        "type": "object",
        "properties": {},
        "required": [],
        default: parentNode.default,
      };
      doc.components.schemas[schemeName] = def;

      for (const fieldName in obj) {
        // arr or object desc
        if (fieldName === "$$t") {
          def.description = obj[fieldName];
        }

        let node = obj[fieldName];
        const nextSchemeName = `${schemeName}.${fieldName}`;

        if (
          // expand $$type: "object|optional"
          node && node.$$type && node.$$type.includes('object')
        ) {
          node = {
            type: 'object',
            optional: node.$$type.includes('optional'),
            $$t: node.$$t || '',
            props: {
              ...node,
            }
          }
        } else if (
          // skip system field in validator scheme
          fieldName.startsWith("$$")
        ) {
          continue;
        }

        if (exclude.includes(fieldName)) {
          continue;
        }

        // expand from short rule to full
        if (!(node && node.type)) {
          node = this.expandShortDefinition(node);
        }

        // mark as required
        if (node.type === "array") {
          if (node.min || node.length || node.max) {
            def.required.push(fieldName);
            def.minItems = node.length || node.min;
            def.maxItems = node.length || node.max;
          }
          def.unique = node.unique;
        } else if (!node.optional) {
          def.required.push(fieldName);
        }

        // common props
        def.properties[fieldName] = {
          description: node.$$t,
        };

        if (node.type === "object") {
          def.properties[fieldName] = {
            ...def.properties[fieldName],
            $ref: `#/components/schemas/${nextSchemeName}`,
          };
          this.createSchemaFromParams(doc, nextSchemeName, node.props, [], node);
          continue;
        }

        // array with objects
        if (node.type === "array" && node.items && node.items.type === "object") {
          def.properties[fieldName] = {
            ...def.properties[fieldName],
            type: "array",
            default: node.default,
            unique: node.unique,
            minItems: node.length || node.min,
            maxItems: node.length || node.max,
            items: {
              $ref: `#/components/schemas/${nextSchemeName}`,
            },
          };
          this.createSchemaFromParams(doc, nextSchemeName, node.items.props, [], node);
          continue;
        }

        // simple array
        if (node.type === "array") {
          def.properties[fieldName] = {
            ...def.properties[fieldName],
            type: "array",
            items: this.getTypeAndExample({
              default: node.default,
              enum: node.enum,
              type: node.items,
            }),
            unique: node.unique,
            minItems: node.length || node.min,
            maxItems: node.length || node.max,
          };
          continue;
        }

        // string/number/boolean
        def.properties[fieldName] = {
          ...def.properties[fieldName],
          ...this.getTypeAndExample(node),
        };
      }

      if (def.required.length === 0) {
        delete def.required;
      }
    },
    getTypeAndExample(node) {
      if (!node) {
        node = {};
      }
      let out = {};

      switch (node.type) {
        case NODE_TYPES.boolean:
          out = {
            example: false,
            type: "boolean",
          };
          break;
        case NODE_TYPES.number:
          out = {
            example: null,
            type: "number",
          };
          break;
        case NODE_TYPES.date:
          out = {
            example: "1998-01-10T13:00:00.000Z",
            type: "string",
            format: "date-time",
          };
          break;
        case NODE_TYPES.uuid:
          out = {
            example: "10ba038e-48da-487b-96e8-8d3b99b6d18a",
            type: "string",
            format: "uuid",
          };
          break;
        case NODE_TYPES.email:
          out = {
            example: "foo@example.com",
            type: "string",
            format: "email",
          };
          break;
        case NODE_TYPES.url:
          out = {
            example: "https://example.com",
            type: "string",
            format: "uri",
          };
          break;
        case NODE_TYPES.enum:
          out = {
            type: "string",
            enum: node.values,
            example: node.values ? node.values[0] : undefined,
          };
          break;
        default:
          out = {
            example: "",
            type: "string",
          };
          break;
      }

      if (node.enum) {
        out.example = node.enum[0];
        out.enum = node.enum;
      }

      if (node.default) {
        out.default = node.default;
        delete out.example;
      }

      out.minLength = node.length || node.min;
      out.maxLength = node.length || node.min;

      return out;
    },
    mergePathItemObjects(orig = {}, toMerge = {}) {
      for (const key in toMerge) {
        // merge components
        if (key === "components") {
          orig[key] = this.mergeObjects(
            orig[key],
            toMerge[key],
          );
          continue;
        }

        // merge responses
        if (key === "responses") {
          let next = false;
          Object.keys(toMerge[key]).forEach(statusCode => {
            if(Object.keys(toMerge[key][statusCode]).includes('type')) {
              next = true;
              return;
            }
          });
          if(next) continue;
          orig[key] = toMerge[key];
          continue;
        }

        // replace non components attributes
        orig[key] = toMerge[key];
      }
      return orig;
    },
    mergeObjects(orig = {}, toMerge = {}) {
      for (const key in toMerge) {
        orig[key] = {
          ...(orig[key] || {}),
          ...toMerge[key],
        };
      }
      return orig;
    },
    /**
     * replace // to /
     * @param path
     * @returns {string}
     */
    normalizePath(path = "") {
      path = path.replace(/\/{2,}/g, "/");
      return path;
    },
    /**
     * convert /:table to /{table}
     * @param url
     * @returns {string|string}
     */
    formatParamUrl(url = "") {
      let start = url.indexOf("/:");
      if (start === -1) {
        return url;
      }

      const end = url.indexOf("/", ++start);

      if (end === -1) {
        return url.slice(0, start) + "{" + url.slice(++start) + "}";
      }

      return this.formatParamUrl(url.slice(0, start) + "{" + url.slice(++start, end) + "}" + url.slice(end));
    },
    /**
     * extract params from /{table}
     * @param url
     * @returns {[]}
     */
    extractParamsFromUrl(url = "") {
      const params = [];
      const added = [];

      const matches = [...this.matchAll(/{(\w+)}/g, url)];
      for (const match of matches) {
        const [, name] = match;

        added.push(name);
        params.push({ name, "in": "path", "required": true, "schema": { type: "string" } });
      }

      return [params, added];
    },
    /**
     * matchAll polyfill for es8 and older
     * @param regexPattern
     * @param sourceString
     * @returns {[]}
     */
    matchAll(regexPattern, sourceString) {
      const output = [];
      let match;
      // make sure the pattern has the global flag
      const regexPatternWithGlobal = RegExp(regexPattern, "g");
      while ((match = regexPatternWithGlobal.exec(sourceString)) !== null) {
        // get rid of the string copy
        delete match.input;
        // store the match data
        output.push(match);
      }
      return output;
    },
    expandShortDefinition(shortDefinition) {
      const node = {
        type: "string",
      };

      let params = shortDefinition.split('|');
      params = params.map(v => v.trim());

      if (params.includes('optional')) {
        node.optional = true;
      }

      for (const type of Object.values(NODE_TYPES)) {
        if (params.includes(type)) {
          node.type = type;
          break;
        } else if (params.includes(`${type}[]`)) {
          const [arrayType,] = node.type.split("[");
          node.type = "array";
          node.items = arrayType;
          break;
        }
      }

      return node;
    },
  },
  started() {
    this.logger.info(`📜OpenAPI Docs server is available at http://0.0.0.0:${this.settings.port}${this.settings.uiPath}`);
  },
};

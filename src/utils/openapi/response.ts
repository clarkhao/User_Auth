/**
 * 描述400以上的响应
 */
export const responses = {
  BadRequest: {
    description: "400 Client side errors",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/SimpleMessage",
        },
      },
    },
  },
  FailedAuth: {
    description: "401 Authentication information is missing or invalid",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/SimpleMessage",
        },
      },
    },
  },
  InvalidRole: {
    description: "403 not aurhorized",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/SimpleMessage",
        },
      },
    },
  },
  NotFound: {
    description: "404 The user name or email not found or invalid",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/SimpleMessage",
        },
      },
    },
  },
  NoSuchMethod: {
    description: "405 the request methods not allowd",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/SimpleMessage",
        },
      },
    },
  },
  ConflictId: {
    description: "409 Already used user name or email",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/SimpleMessage",
        },
      },
    },
  },
  ServerMistake: {
    description: "500 Server Inner Mistake",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/SimpleMessage",
        },
      },
    },
  },
  UpstreamMistake: {
    description: "502 Upstream Server is temporarily not available",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/SimpleMessage",
        },
      },
    },
  },
};

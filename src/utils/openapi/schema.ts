/**
 *
 */
export const schemas = {
  SimpleMessage: {
    type: "object",
    properties: {
      msg: {
        type: "string",
      },
    },
  },
  Token: {
    type: "object",
    properties: {
      token: {
        type: "string",
      },
      originalUrl: {
        type: "string",
      },
      locale: {
        type: "string",
      },
      userInfo: {
        $ref: "#/components/schemas/UserInfo",
      },
      id: {
        type: "string",
      },
    },
  },
  UserInfo: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "user name",
      },
      email: {
        type: "string",
        description: "user email",
      },
      role: {
        type: "string",
        description: "pending, user or admin",
      },
    },
  },
  Encrypted: {
    type: "object",
    properties: {
      data: {
        type: "string",
        description: "data:publicEncrypted(key:iv) connected",
      },
    },
  },
  Profile: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "user id by db",
      },
      name: {
        type: "string",
        description: "user name",
      },
      email: {
        type: "string",
        description: "user email",
      },
      role: {
        type: "string",
        description: "pending, user or admin",
      },
      locale: {
        type: "string",
      },
      picture: {
        type: "string",
        description: "user profile picture addr url",
      },
      bio: {
        type: "string",
      },
      createAt: {
        type: "string",
      },
      lastModifiedAt: {
        type: "string",
      },
    },
  },
};

/** 
* 
*/
export const schemas = {
  SimpleMessage: {
    type: 'object',
    properties: {
      msg: {
        type: 'string'
      }
    }
  },
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: 'user id'
      },
      name: {
        type: 'string',
        description: 'user name'
      },
      email: {
        type: 'string',
        description: 'user email'
      },
      photo: {
        type: 'string',
        description: 'user profile photo url'
      }
    }
  },
  Encrypted: {
    type: 'object',
    properties: {
      data: {
        type: 'string',
        description: 'data:publicEncrypted(key:iv) connected'
      }
    }
  }
}
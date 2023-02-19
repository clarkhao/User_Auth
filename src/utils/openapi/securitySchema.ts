/** 
* 
*/
export const securitySchemas = {
  HttpOnlyCookie: {
    type: 'apiKey',
    in: 'cookie',
    name: 'token'
  },
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
  },
  github_oauth: {
    type: 'oauth2',
    description: 'github oauth',
    flows: {
      authorizationCode: {
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: {
          read: 'Grants read access to public information',
          write: 'Grants write access to public information',
          admin: 'Grants read and write access to administrative information'
        }
      }
    }
  }
}
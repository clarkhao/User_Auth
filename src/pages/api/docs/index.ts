import { withSwagger } from 'next-swagger-doc';
import config from 'config';
import { responses, schemas, securitySchemas } from 'src/utils';
/**
 * 生成openapi.json文件
 */
const swaggerHandler = withSwagger({
  definition: {
      openapi: '3.0.0',
      info: {
        title: 'Next Swagger API Example',
        version: '1.0',
      },
      servers: [
        {
          url: (config.get('server.host') as string).concat(":").concat(config.get('server.port')),
          description: 'development mode url'
        }
      ],
      components: {
        responses: responses,
        schemas: schemas,
        securitySchemes: securitySchemas
      },
    },
  apiFolder: 'src/pages/api'
});

export default swaggerHandler();
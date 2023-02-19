import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import config from 'config';
import { responses, schemas, securitySchemas } from 'src/utils';

const SwaggerUI = dynamic<{
  spec: any;
}>(import('swagger-ui-react'), { ssr: false });

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  return <SwaggerUI spec={ spec } />;
}

export const getStaticProps: GetStaticProps = async () => {
  const spec: Record<string, any> = createSwaggerSpec({
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

  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc;
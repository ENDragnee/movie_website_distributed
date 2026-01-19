import { PROVIDERS_LIST } from '@consumet/extensions';
import {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
  RegisterOptions,
} from 'fastify';

type ProvidersRequest = FastifyRequest<{
  Querystring: {
    type: keyof typeof PROVIDERS_LIST;
  };
}>;

export default class Providers {
  public getProviders = async (
    fastify: FastifyInstance,
    options: RegisterOptions,
  ) => {
    fastify.get(
      '/providers',
      {
        schema: {
          querystring: {
            type: 'object',
            required: ['type'],
            properties: {
              type: {
                type: 'string',
                enum: Object.keys(PROVIDERS_LIST),
              },
            },
          },
        },
      },
      async (request: ProvidersRequest, reply: FastifyReply) => {
        const { type } = request.query;

        const providers = Object.values(PROVIDERS_LIST[type])
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((provider) => provider.toString());

        return reply.status(200).send(providers);
      },
    );
  };
}

import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RegisterOptions,
} from 'fastify';

import Providers from './providers';

const routes = async (
  fastify: FastifyInstance,
  options: RegisterOptions,
) => {
  fastify.register(new Providers().getProviders);

  fastify.get(
    '/',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(200).send('Welcome to Consumet Utils!');
    },
  );
};

export default routes;

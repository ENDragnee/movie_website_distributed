import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { COMICS } from '@consumet/extensions';

import cache from '../../utils/cache';
import { redis, REDIS_TTL } from '../../main';
import { Redis } from 'ioredis';

const routes = async (fastify: FastifyInstance, _options: RegisterOptions) => {
  const getComics = new COMICS.GetComics();

  // Root route
  fastify.get('/', (_, reply) => {
    reply.send({
      intro: `Welcome to the getComics provider: check out the provider's website @ ${getComics.toString.baseUrl}`,
      routes: ['/:query'],
      documentation: 'https://docs.consumet.org/#tag/getComics',
    });
  });

  // --- SEARCH ---
  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const { comicTitle } = request.query as { comicTitle?: string };
    const page = (request.query as { page?: number }).page ?? 1;

    if (!comicTitle || comicTitle.length < 4) {
      return reply.status(400).send({
        message: 'length of comicTitle must be > 4 characters',
        error: 'short_length',
      });
    }

    try {
      const result = redis
        ? await cache.fetch(
            redis as Redis,
            `getcomics:search:${comicTitle}:${page}`,
            () => getComics.search(comicTitle, page),
            REDIS_TTL
          )
        : await getComics.search(comicTitle, page);

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Contact developer for help.',
      });
    }
  });
};

export default routes;

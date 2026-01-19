import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { ANIME } from '@consumet/extensions';
import { StreamingServers, SubOrSub } from '@consumet/extensions/dist/models';

import cache from '../../utils/cache';
import { redis, REDIS_TTL } from '../../main';
import { Redis } from 'ioredis';

const routes = async (fastify: FastifyInstance, _options: RegisterOptions) => {
  const animekai = new ANIME.AnimeKai();

  // Root route
  fastify.get('/', (_, reply) => {
    reply.send({
      intro: `Welcome to the animekai provider: check out the provider's website @ ${animekai.toString.baseUrl}`,
      routes: [
        '/:query',
        '/latest-completed',
        '/new-releases',
        '/recent-added',
        '/recent-episodes',
        '/schedule/:date',
        '/spotlight',
        '/search-suggestions/:query',
        '/servers',
        '/info',
        '/watch/:episodeId',
        '/genre/list',
        '/genre/:genre',
        '/movies',
        '/ona',
        '/ova',
        '/specials',
        '/tv',
      ],
      documentation: 'https://docs.consumet.org/#tag/animekai',
    });
  });

  // Generic function to handle cached requests
  const handleCachedRequest = async <T>(
    key: string,
    fn: () => Promise<T>,
    reply: FastifyReply,
  ) => {
    try {
      const result = redis
        ? await cache.fetch(redis as Redis, key, fn, REDIS_TTL)
        : await fn();
      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Contact developer for help.',
      });
    }
  };

  // Example: /:query
  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const { query } = request.params as { query: string };
    const { page = 1 } = request.query as { page?: number };
    await handleCachedRequest(`animekai:search:${query}:${page}`, () => animekai.search(query, page), reply);
  });

  // /latest-completed
  fastify.get('/latest-completed', async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1 } = request.query as { page?: number };
    await handleCachedRequest(`animekai:latest-completed:${page}`, () => animekai.fetchLatestCompleted(page), reply);
  });

  // /new-releases
  fastify.get('/new-releases', async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1 } = request.query as { page?: number };
    await handleCachedRequest(`animekai:new-releases:${page}`, () => animekai.fetchNewReleases(page), reply);
  });

  // /recent-added
  fastify.get('/recent-added', async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1 } = request.query as { page?: number };
    await handleCachedRequest(`animekai:recent-added:${page}`, () => animekai.fetchRecentlyAdded(page), reply);
  });

  // /recent-episodes
  fastify.get('/recent-episodes', async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1 } = request.query as { page?: number };
    await handleCachedRequest(`animekai:recent-episodes:${page}`, () => animekai.fetchRecentlyUpdated(page), reply);
  });

  // /schedule/:date
  fastify.get('/schedule/:date', async (request: FastifyRequest, reply: FastifyReply) => {
    const { date } = request.params as { date: string };
    await handleCachedRequest(`animekai:schedule:${date}`, () => animekai.fetchSchedule(date), reply);
  });

  // /spotlight
  fastify.get('/spotlight', async (_request: FastifyRequest, reply: FastifyReply) => {
    await handleCachedRequest(`animekai:spotlight`, () => animekai.fetchSpotlight(), reply);
  });

  // Other routes can be refactored similarly...
};

export default routes;

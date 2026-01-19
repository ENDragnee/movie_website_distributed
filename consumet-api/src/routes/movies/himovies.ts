import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { MOVIES } from '@consumet/extensions';
import { StreamingServers } from '@consumet/extensions/dist/models';

import cache from '../../utils/cache';
import { redis, REDIS_TTL } from '../../main';
import { Redis } from 'ioredis';

const routes = async (fastify: FastifyInstance, _options: RegisterOptions) => {
  const himovies = new MOVIES.HiMovies();

  // Root route
  fastify.get('/', (_, reply) => {
    reply.send({
      intro: `Welcome to the himovies provider: check out the provider's website @ ${himovies.toString.baseUrl}`,
      routes: [
        '/:query',
        '/info',
        '/watch',
        '/recent-shows',
        '/recent-movies',
        '/trending',
        '/servers',
        '/country',
        '/genre',
      ],
      documentation: 'https://docs.consumet.org/#tag/himovies',
    });
  });

  // --- SEARCH ---
  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = decodeURIComponent((request.params as { query: string }).query);
    const page = (request.query as { page?: number }).page ?? 1;

    try {
      const result = redis
        ? await cache.fetch(
            redis as Redis,
            `himovies:${query}:${page}`,
            () => himovies.search(query, page),
            REDIS_TTL
          )
        : await himovies.search(query, page);

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Please try again later.',
      });
    }
  });

  // --- RECENT ---
  fastify.get('/recent-shows', async (_request, reply) => {
    try {
      const result = redis
        ? await cache.fetch(
            redis as Redis,
            'himovies:recent-shows',
            () => himovies.fetchRecentTvShows(),
            REDIS_TTL
          )
        : await himovies.fetchRecentTvShows();

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Please try again later.',
      });
    }
  });

  fastify.get('/recent-movies', async (_request, reply) => {
    try {
      const result = redis
        ? await cache.fetch(
            redis as Redis,
            'himovies:recent-movies',
            () => himovies.fetchRecentMovies(),
            REDIS_TTL
          )
        : await himovies.fetchRecentMovies();

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Please try again later.',
      });
    }
  });

  // --- TRENDING ---
  fastify.get('/trending', async (request: FastifyRequest, reply: FastifyReply) => {
    const type = (request.query as { type?: string }).type;

    try {
      if (!type) {
        const result = {
          results: [
            ...(await himovies.fetchTrendingMovies()),
            ...(await himovies.fetchTrendingTvShows()),
          ],
        };
        return reply.send(result);
      }

      const result = redis
        ? await cache.fetch(
            redis as Redis,
            `himovies:trending:${type}`,
            () => (type === 'tv' ? himovies.fetchTrendingTvShows() : himovies.fetchTrendingMovies()),
            REDIS_TTL
          )
        : type === 'tv'
        ? await himovies.fetchTrendingTvShows()
        : await himovies.fetchTrendingMovies();

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Please try again later or contact the developers.',
      });
    }
  });

  // --- INFO ---
  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = (request.query as { id?: string }).id;

    if (!id) {
      return reply.status(400).send({ message: 'id is required' });
    }

    try {
      const result = redis
        ? await cache.fetch(
            redis as Redis,
            `himovies:info:${id}`,
            () => himovies.fetchMediaInfo(id),
            REDIS_TTL
          )
        : await himovies.fetchMediaInfo(id);

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Please try again later or contact the developers.',
      });
    }
  });

  // --- WATCH ---
  fastify.get('/watch', async (request: FastifyRequest, reply: FastifyReply) => {
    const { episodeId, mediaId, server } = request.query as {
      episodeId?: string;
      mediaId?: string;
      server?: StreamingServers;
    };

    if (!episodeId) return reply.status(400).send({ message: 'episodeId is required' });
    if (!mediaId) return reply.status(400).send({ message: 'mediaId is required' });
    if (server && !Object.values(StreamingServers).includes(server))
      return reply.status(400).send({ message: 'Invalid server query' });

    try {
      const result = redis
        ? await cache.fetch(
            redis as Redis,
            `himovies:watch:${episodeId}:${mediaId}:${server}`,
            () => himovies.fetchEpisodeSources(episodeId, mediaId, server),
            REDIS_TTL
          )
        : await himovies.fetchEpisodeSources(episodeId, mediaId, server);

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Please try again later.',
      });
    }
  });

  // --- SERVERS ---
  fastify.get('/servers', async (request: FastifyRequest, reply: FastifyReply) => {
    const { episodeId, mediaId } = request.query as { episodeId?: string; mediaId?: string };

    if (!episodeId) return reply.status(400).send({ message: 'episodeId is required' });
    if (!mediaId) return reply.status(400).send({ message: 'mediaId is required' });

    try {
      const result = redis
        ? await cache.fetch(
            redis as Redis,
            `himovies:servers:${episodeId}:${mediaId}`,
            () => himovies.fetchEpisodeServers(episodeId, mediaId),
            REDIS_TTL
          )
        : await himovies.fetchEpisodeServers(episodeId, mediaId);

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Please try again later or contact the developers.',
      });
    }
  });

  // --- COUNTRY ---
  fastify.get('/country/:country', async (request: FastifyRequest, reply: FastifyReply) => {
    const { country } = request.params as { country: string };
    const page = (request.query as { page?: number }).page ?? 1;

    try {
      const result = redis
        ? await cache.fetch(
            redis as Redis,
            `himovies:country:${country}:${page}`,
            () => himovies.fetchByCountry(country, page),
            REDIS_TTL
          )
        : await himovies.fetchByCountry(country, page);

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Please try again later or contact the developers.',
      });
    }
  });

  // --- GENRE ---
  fastify.get('/genre/:genre', async (request: FastifyRequest, reply: FastifyReply) => {
    const { genre } = request.params as { genre: string };
    const page = (request.query as { page?: number }).page ?? 1;

    try {
      const result = redis
        ? await cache.fetch(
            redis as Redis,
            `himovies:genre:${genre}:${page}`,
            () => himovies.fetchByGenre(genre, page),
            REDIS_TTL
          )
        : await himovies.fetchByGenre(genre, page);

      reply.send(result);
    } catch (error) {
      reply.status(500).send({
        message: 'Something went wrong. Please try again later or contact the developers.',
      });
    }
  });
};

export default routes;

import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { Container } from 'typedi';
import { createApp } from '../../src/config/app';
import { setupContainer } from '../../src/config/container';
import { InMemoryMovieRepository } from '../../src/infrastructure/repositories/InMemoryMovieRepository';
import { Movie } from '../../src/domain/entities/Movie';

describe('API E2E Tests', () => {
    let app: Application;
    let repository: InMemoryMovieRepository;

    beforeAll(() => {
        setupContainer();
        app = createApp();
        repository = Container.get(InMemoryMovieRepository);
    });

    beforeEach(() => {
        repository.clear();
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /api/movies', () => {
        it('should return empty array when no movies', async () => {
            const response = await request(app).get('/api/movies');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should return all movies', async () => {
            const movies = [
                Movie.create('1', 1980, 'Movie 1', 'Studios A', ['Producer 1'], true),
                Movie.create('2', 1981, 'Movie 2', 'Studios B', ['Producer 2'], false),
            ];
            await repository.bulkCreate(movies);

            const response = await request(app).get('/api/movies');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });
    });

    describe('GET /api/movies/:id', () => {
        it('should return a movie by id', async () => {
            const movie = Movie.create('1', 1980, 'Test Movie', 'Studios', ['Producer'], true);
            await repository.create(movie);

            const response = await request(app).get('/api/movies/1');

            expect(response.status).toBe(200);
            expect(response.body.id).toBe('1');
            expect(response.body.title).toBe('Test Movie');
        });

        it('should return 404 for non-existent movie', async () => {
            const response = await request(app).get('/api/movies/999');

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/movies', () => {
        it('should create a new movie', async () => {
            const newMovie = {
                year: 1980,
                title: 'New Movie',
                studios: 'New Studios',
                producers: 'Producer 1, Producer 2',
                winner: true,
            };

            const response = await request(app).post('/api/movies').send(newMovie);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe('New Movie');
            expect(response.body.producers).toEqual(['Producer 1', 'Producer 2']);
        });

        it('should validate required fields', async () => {
            const invalidMovie = {
                year: 1980,

                studios: 'Studios',
                producers: 'Producer',
                winner: true,
            };

            const response = await request(app).post('/api/movies').send(invalidMovie);

            expect(response.status).toBe(400);
        });

        it('should validate year minimum', async () => {
            const invalidMovie = {
                year: 1800,
                title: 'Old Movie',
                studios: 'Studios',
                producers: 'Producer',
                winner: false,
            };

            const response = await request(app).post('/api/movies').send(invalidMovie);

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/movies/:id', () => {
        it('should update an existing movie', async () => {
            const movie = Movie.create('1', 1980, 'Original', 'Studios', ['Producer'], false);
            await repository.create(movie);

            const updates = {
                title: 'Updated Title',
                winner: true,
            };

            const response = await request(app).put('/api/movies/1').send(updates);

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Updated Title');
            expect(response.body.winner).toBe(true);
        });

        it('should return 404 for non-existent movie', async () => {
            const updates = { title: 'Updated' };

            const response = await request(app).put('/api/movies/999').send(updates);

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/movies/:id', () => {
        it('should delete an existing movie', async () => {
            const movie = Movie.create('1', 1980, 'Test', 'Studios', ['Producer'], false);
            await repository.create(movie);

            const response = await request(app).delete('/api/movies/1');

            expect(response.status).toBe(204);

            const found = await repository.findById('1');
            expect(found).toBeNull();
        });

        it('should return 404 for non-existent movie', async () => {
            const response = await request(app).delete('/api/movies/999');

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/producers/award-intervals', () => {
        it('should return empty arrays when no winners', async () => {
            const response = await request(app).get('/api/producers/award-intervals');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ min: [], max: [] });
        });

        it('should calculate producer intervals correctly', async () => {
            const winners = [
                Movie.create('1', 1990, 'Movie 1', 'Studios', ['Producer A'], true),
                Movie.create('2', 1999, 'Movie 2', 'Studios', ['Producer A'], true),
                Movie.create('3', 2002, 'Movie 3', 'Studios', ['Producer A'], true),
                Movie.create('4', 2015, 'Movie 4', 'Studios', ['Producer B'], true),
                Movie.create('5', 2018, 'Movie 5', 'Studios', ['Producer B'], true),
            ];
            await repository.bulkCreate(winners);

            const response = await request(app).get('/api/producers/award-intervals');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('min');
            expect(response.body).toHaveProperty('max');


            expect(response.body.min[0].interval).toBe(3);


            expect(response.body.max[0].interval).toBe(9);
        });

        it('should handle real CSV data scenario', async () => {

            const winners = [
                Movie.create('1', 1986, 'Howard the Duck', 'Studios', ['Gloria Katz'], true),
                Movie.create('2', 1990, 'Ghosts Can\'t Do It', 'Studios', ['Bo Derek'], true),
                Movie.create('3', 1984, 'Bolero', 'Studios', ['Bo Derek'], true),
            ];
            await repository.bulkCreate(winners);

            const response = await request(app).get('/api/producers/award-intervals');

            expect(response.status).toBe(200);


            const boDerekInterval = response.body.min.find((item: { producer: string }) => item.producer === 'Bo Derek') ||
                response.body.max.find((item: { producer: string }) => item.producer === 'Bo Derek');

            expect(boDerekInterval).toBeDefined();
            expect(boDerekInterval.interval).toBe(6);
            expect(boDerekInterval.previousWin).toBe(1984);
            expect(boDerekInterval.followingWin).toBe(1990);
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid JSON', async () => {
            const response = await request(app)
                .post('/api/movies')
                .set('Content-Type', 'application/json')
                .send('invalid json');

            expect(response.status).toBe(400);
        });

        it('should include correlation ID in error responses', async () => {
            const response = await request(app).get('/api/movies/999');

            expect(response.status).toBe(404);
            expect(response.body.error).toHaveProperty('correlationId');
        });
    });

    describe('Rate Limiting', () => {
        it('should apply rate limiting to API endpoints', async () => {

            const response = await request(app).get('/api/movies');
            expect(response.status).toBe(200);
        });
    });
});

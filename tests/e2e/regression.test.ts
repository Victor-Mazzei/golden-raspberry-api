import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { Container } from 'typedi';
import * as path from 'path';
import { createApp } from '../../src/config/app';
import { setupContainer } from '../../src/config/container';
import { InMemoryMovieRepository } from '../../src/infrastructure/repositories/InMemoryMovieRepository';
import { CsvDataLoader } from '../../src/infrastructure/data/CsvDataLoader';

describe('API Regression Tests (RN2)', () => {
    let app: Application;
    let repository: InMemoryMovieRepository;
    let csvLoader: CsvDataLoader;

    beforeAll(async () => {
        setupContainer();

        app = createApp();
        repository = Container.get(InMemoryMovieRepository);
        csvLoader = Container.get(CsvDataLoader);

        repository.clear();

        const csvPath = path.resolve(__dirname, '../../data/Movielist.csv');
        const movies = await csvLoader.loadMoviesFromCsv(csvPath);
        await repository.bulkCreate(movies);
    });

    it('should return the exact expected intervals based on the standard Movielist.csv', async () => {
        const response = await request(app).get('/api/producers/award-intervals');

        expect(response.status).toBe(200);



        const expectedResponse = {
            min: [
                {
                    producer: 'Joel Silver',
                    interval: 1,
                    previousWin: 1990,
                    followingWin: 1991
                }
            ],
            max: [
                {
                    producer: 'Matthew Vaughn',
                    interval: 13,
                    previousWin: 2002,
                    followingWin: 2015
                }
            ]
        };

        expect(response.body).toEqual(expectedResponse);
    });
});

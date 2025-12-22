import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { Container } from 'typedi';
import { createApp } from './config/app';
import { setupContainer } from './config/container';
import { Logger } from '@infrastructure/logging/Logger';
import { CsvDataLoader } from '@infrastructure/data/CsvDataLoader';
import { InMemoryMovieRepository } from '@infrastructure/repositories/InMemoryMovieRepository';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const CSV_FILE_PATH = process.env.CSV_FILE_PATH || './data/Movielist.csv';

async function bootstrap(): Promise<void> {
    const logger = Container.get(Logger);

    try {
        logger.info('Starting Golden Raspberry Awards API...');

        // Setup dependency injection
        setupContainer();

        // Load CSV data
        logger.info('Loading movie data from CSV...');
        const csvLoader = Container.get(CsvDataLoader);
        const movies = await csvLoader.loadMoviesFromCsv(CSV_FILE_PATH);

        const movieRepository = Container.get(InMemoryMovieRepository);
        await movieRepository.bulkCreate(movies);

        logger.info(`Loaded ${movies.length} movies into repository`);

        // Create and start Express app
        const app = createApp();

        const server = app.listen(PORT, HOST, () => {
            logger.info(`Server is running on http://${HOST}:${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info('API Endpoints:');
            logger.info(`  - GET  /health`);
            logger.info(`  - GET  /api/producers/award-intervals`);
            logger.info(`  - GET  /api/movies`);
            logger.info(`  - GET  /api/movies/:id`);
            logger.info(`  - POST /api/movies`);
            logger.info(`  - PUT  /api/movies/:id`);
            logger.info(`  - DELETE /api/movies/:id`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string): Promise<void> => {
            logger.info(`${signal} received, shutting down gracefully...`);

            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.error('Failed to start server', error as Error);
        process.exit(1);
    }
}

// Start the application
bootstrap();

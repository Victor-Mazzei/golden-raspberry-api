import 'reflect-metadata';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { useExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { MovieController } from '@presentation/controllers/MovieController';
import { ProducerController } from '@presentation/controllers/ProducerController';
import { HealthController } from '@presentation/controllers/HealthController';
import { ErrorHandler } from '@presentation/middleware/ErrorHandler';
import { RequestLogger } from '@presentation/middleware/RequestLogger';

export function createApp(): Application {
    const app = express();

    // Use TypeDI container for routing-controllers
    useContainer(Container);

    // Security middleware
    app.use(helmet());

    // CORS
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    app.use(
        cors({
            origin: corsOrigin,
            credentials: true,
        })
    );

    // Rate limiting
    const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
    const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

    const limiter = rateLimit({
        windowMs: rateLimitWindowMs,
        max: rateLimitMaxRequests,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use('/api', limiter);

    // Body parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    const requestLogger = Container.get(RequestLogger);
    app.use(requestLogger.middleware());

    // Setup routing-controllers
    const routingControllersOptions = {
        controllers: [MovieController, ProducerController, HealthController],
        middlewares: [ErrorHandler],
        defaultErrorHandler: false,
        validation: true,
        classTransformer: true,
    };

    useExpressServer(app, routingControllersOptions);

    // Swagger Documentation (Non-production only)
    if (process.env.NODE_ENV !== 'production') {
        const { validationMetadatasToSchemas } = require('class-validator-jsonschema');
        const { getMetadataArgsStorage } = require('routing-controllers');
        const { routingControllersToSpec } = require('routing-controllers-openapi');
        const swaggerUi = require('swagger-ui-express');

        const schemas = validationMetadatasToSchemas({
            refPointerPrefix: '#/components/schemas/',
        });

        const spec = routingControllersToSpec(
            getMetadataArgsStorage(),
            routingControllersOptions,
            {
                components: {
                    schemas,
                },
                info: {
                    description: 'API for Golden Raspberry Awards (Worst Film Awards) management and statistics.',
                    title: 'Golden Raspberry Awards API',
                    version: '1.0.0',
                },
            }
        );

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
        app.get('/openapi.json', (_req, res) => res.json(spec));
    }

    return app;
}



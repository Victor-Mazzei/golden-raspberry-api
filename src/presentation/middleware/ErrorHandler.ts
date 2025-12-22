import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { Logger } from '@infrastructure/logging/Logger';

@Service()
@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
    constructor(private readonly logger: Logger) { }

    error(error: Error, request: Request, response: Response, _next: NextFunction): void {
        const correlationId = (request as Request & { correlationId?: string }).correlationId;

        this.logger.error('Unhandled API error', error, {
            correlationId,
            method: request.method,
            path: request.path,
            body: request.body,
            stack: error.stack,
            name: error.name
        });


        // Determine status code
        let statusCode = (error as any).httpCode || (error as any).status || 500;
        let message = error.message || 'Internal server error';

        if (message.toLowerCase().includes('not found')) {
            statusCode = 404;
        } else if (message.toLowerCase().includes('validation') || (error as any).errors) {
            statusCode = 400;
            // Extract validation errors if present
            if ((error as any).errors && Array.isArray((error as any).errors)) {
                message = 'Validation failed: ' + (error as any).errors.map((e: any) =>
                    Object.values(e.constraints || {}).join(', ')
                ).join('; ');
            }
        } else if (error.name === 'BadRequestError') {
            statusCode = 400;
        } else if (error.name === 'SyntaxError' && message.includes('JSON')) {
            statusCode = 400;
            message = 'Invalid JSON in request body';
        }


        // Send error response
        const errorResponse = {
            error: {
                message,
                correlationId,
                timestamp: new Date().toISOString(),
                ...(process.env.NODE_ENV === 'development' && {
                    stack: error.stack,
                    details: error.message,
                }),
            },
        };

        this.logger.debug(`Sending error response with status ${statusCode}`, { correlationId, statusCode });
        response.status(statusCode).json(errorResponse);
    }
}


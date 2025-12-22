import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Service } from 'typedi';
import { Logger } from '@infrastructure/logging/Logger';

@Service()
export class RequestLogger {
    constructor(private readonly logger: Logger) { }

    middleware() {
        return (req: Request, res: Response, next: NextFunction): void => {
            const correlationId = uuidv4();
            (req as Request & { correlationId?: string }).correlationId = correlationId;

            const startTime = Date.now();

            // Log request
            this.logger.http(`${req.method} ${req.path}`, {
                correlationId,
                method: req.method,
                path: req.path,
                query: req.query,
                ip: req.ip,
            });

            // Log response when finished
            res.on('finish', () => {
                const duration = Date.now() - startTime;
                this.logger.http(`${req.method} ${req.path} - ${res.statusCode}`, {
                    correlationId,
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`,
                });
            });

            next();
        };
    }
}

import * as winston from 'winston';
import { Service } from 'typedi';

@Service()
export class Logger {
    private logger: winston.Logger;

    constructor() {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'http' : 'info');

        this.logger = winston.createLogger({
            level: logLevel,
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                isDevelopment ? winston.format.colorize() : winston.format.uncolorize(),
                winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
                    const correlation = correlationId ? `[${correlationId}] ` : '';
                    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
                    return `${timestamp} ${level}: ${correlation}${message}${metaStr}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                ...(isDevelopment
                    ? []
                    : [
                        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                        new winston.transports.File({ filename: 'logs/combined.log' }),
                    ]),
            ],
        });
    }

    info(message: string, meta?: Record<string, unknown>): void {
        this.logger.info(message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        this.logger.warn(message, meta);
    }

    error(message: string, error?: Error, meta?: Record<string, unknown>): void {
        this.logger.error(message, { ...meta, error: error?.stack || error?.message });
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        this.logger.debug(message, meta);
    }

    http(message: string, meta?: Record<string, unknown>): void {
        this.logger.http(message, meta);
    }
}

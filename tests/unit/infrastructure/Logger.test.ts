import { Logger } from '@infrastructure/logging/Logger';

describe('Logger', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should initialize with default levels in development', () => {
        process.env.NODE_ENV = 'development';
        delete process.env.LOG_LEVEL;
        const logger = new Logger();
        expect(logger).toBeDefined();
    });

    it('should initialize with explicit LOG_LEVEL', () => {
        process.env.LOG_LEVEL = 'debug';
        const logger = new Logger();
        expect(logger).toBeDefined();
    });

    it('should initialize with production settings', () => {
        process.env.NODE_ENV = 'production';
        delete process.env.LOG_LEVEL;
        const logger = new Logger();
        expect(logger).toBeDefined();
    });

    it('should log messages at all levels', () => {
        const logger = new Logger();
        const spy = jest.spyOn((logger as any).logger, 'log');

        logger.info('info message');
        logger.warn('warn message');
        logger.debug('debug message');
        logger.http('http message');
        logger.error('error message', new Error('test error'));

        expect(spy).toHaveBeenCalledTimes(5);
    });

    it('should handle error without stack', () => {
        const logger = new Logger();
        const spy = jest.spyOn((logger as any).logger, 'error');

        logger.error('error message', { message: 'no stack' } as any);
        expect(spy).toHaveBeenCalled();
    });
});

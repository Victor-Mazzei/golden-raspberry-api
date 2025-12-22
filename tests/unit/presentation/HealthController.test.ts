import { HealthController } from '@presentation/controllers/HealthController';

describe('HealthController', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return health status with development default', () => {
        delete process.env.NODE_ENV;
        const controller = new HealthController();
        const response = controller.getHealth();

        expect(response.status).toBe('healthy');
        expect(response.environment).toBe('development');
    });

    it('should return health status with explicit environment', () => {
        process.env.NODE_ENV = 'production';
        const controller = new HealthController();
        const response = controller.getHealth();

        expect(response.status).toBe('healthy');
        expect(response.environment).toBe('production');
    });
});

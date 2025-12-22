import { JsonController, Get } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController('/health')
export class HealthController {
    private startTime: number;

    constructor() {
        this.startTime = Date.now();
    }

    @Get('/')
    getHealth() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);

        return {
            status: 'healthy',
            uptime,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
        };
    }
}

import { JsonController, Get } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ProducerIntervalService } from '@application/services/ProducerIntervalService';
import { ProducerIntervalsResponse } from '@application/dtos/ProducerIntervalDto';

/**
 * Controller for managing Producer statistics.
 * Provides endpoints for award interval calculations.
 */
@Service()
@JsonController('/api/producers')
export class ProducerController {
    constructor(
        @Inject()
        private readonly producerIntervalService: ProducerIntervalService
    ) { }


    /**
     * Calculates the minimum and maximum intervals between consecutive awards for all producers.
     * @returns Object containing min and max interval lists
     */
    @Get('/award-intervals')
    @OpenAPI({
        summary: 'Get min/max award intervals for producers',
        description: 'Returns producers with the shortest and longest intervals between two consecutive awards.',
    })
    @ResponseSchema(ProducerIntervalsResponse)
    async getAwardIntervals(): Promise<ProducerIntervalsResponse> {
        return this.producerIntervalService.getProducerIntervals();
    }
}



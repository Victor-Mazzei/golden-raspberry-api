import { Service, Inject } from 'typedi';
import { IMovieRepository } from '@domain/interfaces/IMovieRepository';
import { Producer } from '@domain/entities/Producer';
import { AwardInterval } from '@domain/value-objects/AwardInterval';
import { ProducerIntervalItem, ProducerIntervalsResponse } from '../dtos/ProducerIntervalDto';
import { Logger } from '@infrastructure/logging/Logger';

/**
 * Service responsible for calculating producer award intervals.
 * Analyzing winners to find the shortest and longest gaps between consecutive wins.
 */
@Service()
export class ProducerIntervalService {
    constructor(
        @Inject('IMovieRepository')
        private readonly movieRepository: IMovieRepository,
        @Inject()
        private readonly logger: Logger
    ) { }

    /**
     * Calculates minimum and maximum award intervals for all producers.
     * Only considers producers with at least two wins.
     * @returns Object containing min and max interval lists
     */
    async getProducerIntervals(): Promise<ProducerIntervalsResponse> {
        this.logger.debug('Calculating producer award intervals');
        const winners = await this.movieRepository.findWinners();
        this.logger.debug(`Found ${winners.length} winner movies to analyze`);

        const producerWinsMap = new Map<string, Producer>();

        winners.forEach((movie) => {
            movie.producers.forEach((producerName) => {
                const existing = producerWinsMap.get(producerName);
                if (existing) {
                    producerWinsMap.set(
                        producerName,
                        existing.addWin(movie.year, movie.title)
                    );
                } else {
                    producerWinsMap.set(
                        producerName,
                        Producer.create(producerName, [{ year: movie.year, title: movie.title }])
                    );
                }
            });
        });

        this.logger.debug(`Grouped winners for ${producerWinsMap.size} unique producers`);

        const intervals: AwardInterval[] = [];

        producerWinsMap.forEach((producer) => {
            const winYears = producer.getWinYears();

            // Need at least 2 wins to calculate an interval
            if (winYears.length < 2) {
                return;
            }

            for (let i = 0; i < winYears.length - 1; i += 1) {
                const previousWin = winYears[i];
                const followingWin = winYears[i + 1];
                const interval = followingWin - previousWin;

                intervals.push(
                    AwardInterval.create(producer.name, interval, previousWin, followingWin)
                );
            }
        });

        this.logger.debug(`Calculated ${intervals.length} intervals between consecutive wins`);

        if (intervals.length === 0) {
            this.logger.info('No producer intervals found (no producers with multiple wins)');
            return { min: [], max: [] };
        }

        const minInterval = Math.min(...intervals.map((i) => i.interval));
        const maxInterval = Math.max(...intervals.map((i) => i.interval));

        const minIntervals = intervals
            .filter((i) => i.interval === minInterval)
            .map(this.toDto);

        const maxIntervals = intervals
            .filter((i) => i.interval === maxInterval)
            .map(this.toDto);

        return {
            min: minIntervals,
            max: maxIntervals,
        };
    }

    /**
     * Maps an internal AwardInterval value object to a public DTO.
     * @param interval The award interval to map
     * @returns The mapped DTO item
     */
    private toDto(interval: AwardInterval): ProducerIntervalItem {
        return {
            producer: interval.producer,
            interval: interval.interval,
            previousWin: interval.previousWin,
            followingWin: interval.followingWin,
        };
    }
}


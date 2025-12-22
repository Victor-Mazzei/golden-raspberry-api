import { ProducerIntervalService } from '@application/services/ProducerIntervalService';
import { IMovieRepository } from '@domain/interfaces/IMovieRepository';
import { Movie } from '@domain/entities/Movie';
import { Logger } from '@infrastructure/logging/Logger';

jest.mock('@infrastructure/logging/Logger');

describe('ProducerIntervalService', () => {
    let service: ProducerIntervalService;
    let mockRepository: jest.Mocked<IMovieRepository>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        mockRepository = {
            findWinners: jest.fn(),
        } as any;

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as any;

        service = new ProducerIntervalService(mockRepository, mockLogger);
    });

    describe('getProducerIntervals', () => {
        it('should return empty arrays when no winners', async () => {
            mockRepository.findWinners.mockResolvedValue([]);

            const result = await service.getProducerIntervals();

            expect(result).toEqual({ min: [], max: [] });
            expect(mockRepository.findWinners).toHaveBeenCalledTimes(1);
        });

        it('should return empty arrays when only one winner', async () => {
            const movie = Movie.create('1', 1980, 'Movie', 'Studio', ['Producer'], true);
            mockRepository.findWinners.mockResolvedValue([movie]);

            const result = await service.getProducerIntervals();

            expect(result).toEqual({ min: [], max: [] });
        });

        it('should calculate intervals for producer with multiple wins', async () => {
            const winners = [
                Movie.create('1', 1980, 'Movie 1', 'Studio', ['Producer A'], true),
                Movie.create('2', 1981, 'Movie 2', 'Studio', ['Producer A'], true),
            ];
            mockRepository.findWinners.mockResolvedValue(winners);

            const result = await service.getProducerIntervals();

            expect(result.min).toHaveLength(1);
            expect(result.min[0]).toEqual({
                producer: 'Producer A',
                interval: 1,
                previousWin: 1980,
                followingWin: 1981,
            });
        });

        it('should find minimum and maximum intervals correctly', async () => {
            const winners = [
                Movie.create('1', 1980, 'Movie 1', 'Studio', ['Producer A'], true),
                Movie.create('2', 1981, 'Movie 2', 'Studio', ['Producer A'], true),
                Movie.create('3', 1985, 'Movie 3', 'Studio', ['Producer A'], true),
            ];
            mockRepository.findWinners.mockResolvedValue(winners);

            const result = await service.getProducerIntervals();

            expect(result.min[0].interval).toBe(1);
            expect(result.max[0].interval).toBe(4);
        });

        it('should handle multiple producers with same interval', async () => {
            const winners = [
                Movie.create('1', 1980, 'Movie 1', 'Studio', ['Prod A'], true),
                Movie.create('2', 1981, 'Movie 2', 'Studio', ['Prod A'], true),
                Movie.create('3', 1990, 'Movie 3', 'Studio', ['Prod B'], true),
                Movie.create('4', 1991, 'Movie 4', 'Studio', ['Prod B'], true),
            ];
            mockRepository.findWinners.mockResolvedValue(winners);

            const result = await service.getProducerIntervals();

            expect(result.min).toHaveLength(2);
            expect(result.min.map((p: any) => p.producer)).toContain('Prod A');
            expect(result.min.map((p: any) => p.producer)).toContain('Prod B');
        });

        it('should handle producer with multiple consecutive wins', async () => {
            const winners = [
                Movie.create('1', 1980, 'Movie 1', 'Studio', ['Prod A'], true),
                Movie.create('2', 1985, 'Movie 2', 'Studio', ['Prod A'], true),
                Movie.create('3', 1990, 'Movie 3', 'Studio', ['Prod A'], true),
            ];
            mockRepository.findWinners.mockResolvedValue(winners);

            const result = await service.getProducerIntervals();

            expect(result.min[0].interval).toBe(5);
            expect(result.max[0].interval).toBe(5);
            expect(result.min).toHaveLength(2);
        });

        it('should handle movies with multiple producers', async () => {
            const winners = [
                Movie.create('1', 1980, 'M1', 'S', ['Prod A', 'Prod B'], true),
                Movie.create('2', 1982, 'M2', 'S', ['Prod A'], true),
                Movie.create('3', 1985, 'M3', 'S', ['Prod B'], true),
            ];
            mockRepository.findWinners.mockResolvedValue(winners);

            const result = await service.getProducerIntervals();

            expect(result.min[0].producer).toBe('Prod A');
            expect(result.min[0].interval).toBe(2);
            expect(result.max[0].producer).toBe('Prod B');
            expect(result.max[0].interval).toBe(5);
        });
    });
});

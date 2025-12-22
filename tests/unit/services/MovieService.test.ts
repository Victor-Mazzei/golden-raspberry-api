import { MovieService } from '../../../src/application/services/MovieService';
import { IMovieRepository } from '../../../src/domain/interfaces/IMovieRepository';
import { Movie } from '../../../src/domain/entities/Movie';
import { CreateMovieDto } from '../../../src/application/dtos/CreateMovieDto';
import { UpdateMovieDto } from '../../../src/application/dtos/UpdateMovieDto';
import { Logger } from '../../../src/infrastructure/logging/Logger';


describe('MovieService', () => {
    let movieService: MovieService;
    let mockRepository: jest.Mocked<IMovieRepository>;
    let mockLogger: jest.Mocked<Logger>;


    beforeEach(() => {
        mockRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByYear: jest.fn(),
            findWinners: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        } as any;

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as any;

        movieService = new MovieService(mockRepository, mockLogger);
    });


    describe('getAllMovies', () => {
        it('should return all movies', async () => {
            const movies = [
                Movie.create('1', 1980, 'Test Movie', 'Test Studios', ['Producer 1'], true),
            ];
            mockRepository.findAll.mockResolvedValue(movies);

            const result = await movieService.getAllMovies();

            expect(result).toEqual(movies);
            expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('getMovieById', () => {
        it('should return a movie by id', async () => {
            const movie = Movie.create('1', 1980, 'Test Movie', 'Test Studios', ['Producer 1'], true);
            mockRepository.findById.mockResolvedValue(movie);

            const result = await movieService.getMovieById('1');

            expect(result).toEqual(movie);
            expect(mockRepository.findById).toHaveBeenCalledWith('1');
        });

        it('should throw error if movie not found', async () => {
            mockRepository.findById.mockResolvedValue(null);

            await expect(movieService.getMovieById('999')).rejects.toThrow('Movie with id 999 not found');
        });
    });

    describe('createMovie', () => {
        it('should create a new movie', async () => {
            const dto: CreateMovieDto = {
                year: 1980,
                title: 'New Movie',
                studios: 'New Studios',
                producers: 'Producer 1, Producer 2',
                winner: true,
            };

            const createdMovie = Movie.create(
                'generated-id',
                dto.year,
                dto.title,
                dto.studios,
                ['Producer 1', 'Producer 2'],
                dto.winner
            );

            mockRepository.create.mockResolvedValue(createdMovie);

            const result = await movieService.createMovie(dto);

            expect(result.title).toBe(dto.title);
            expect(result.producers).toEqual(['Producer 1', 'Producer 2']);
            expect(mockRepository.create).toHaveBeenCalledTimes(1);
        });

        it('should parse producers with "and" separator', async () => {
            const dto: CreateMovieDto = {
                year: 1980,
                title: 'New Movie',
                studios: 'New Studios',
                producers: 'Producer 1 and Producer 2',
                winner: false,
            };

            mockRepository.create.mockImplementation((movie) => Promise.resolve(movie));

            const result = await movieService.createMovie(dto);

            expect(result.producers).toEqual(['Producer 1', 'Producer 2']);
        });
    });

    describe('updateMovie', () => {
        it('should update an existing movie', async () => {
            const existingMovie = Movie.create(
                '1',
                1980,
                'Old Title',
                'Old Studios',
                ['Old Producer'],
                false
            );

            const dto: UpdateMovieDto = {
                title: 'Updated Title',
                winner: true,
            };

            mockRepository.findById.mockResolvedValue(existingMovie);
            mockRepository.update.mockImplementation((_id, movie) => Promise.resolve(movie));


            const result = await movieService.updateMovie('1', dto);

            expect(result.title).toBe('Updated Title');
            expect(result.winner).toBe(true);
            expect(mockRepository.update).toHaveBeenCalledTimes(1);
        });

        it('should throw error if repository update fails', async () => {
            const existingMovie = Movie.create('1', 1980, 'Title', 'Studio', ['Prod'], false);
            const dto: UpdateMovieDto = { title: 'New' };

            mockRepository.findById.mockResolvedValue(existingMovie);
            mockRepository.update.mockResolvedValue(null);

            await expect(movieService.updateMovie('1', dto)).rejects.toThrow('Failed to update movie with id 1');
            expect(mockLogger.error).toHaveBeenCalled();
        });


        it('should throw error if movie to update not found', async () => {
            mockRepository.findById.mockResolvedValue(null);

            const dto: UpdateMovieDto = { title: 'Updated' };

            await expect(movieService.updateMovie('999', dto)).rejects.toThrow(
                'Movie with id 999 not found'
            );
        });
    });

    describe('deleteMovie', () => {
        it('should delete a movie', async () => {
            mockRepository.delete.mockResolvedValue(true);

            await movieService.deleteMovie('1');

            expect(mockRepository.delete).toHaveBeenCalledWith('1');
        });

        it('should throw error if movie to delete not found', async () => {
            mockRepository.delete.mockResolvedValue(false);

            await expect(movieService.deleteMovie('999')).rejects.toThrow(
                'Movie with id 999 not found'
            );
        });
    });

    describe('getMovieCount', () => {
        it('should return movie count', async () => {
            mockRepository.count.mockResolvedValue(10);
            const result = await movieService.getMovieCount();
            expect(result).toBe(10);
        });
    });

    describe('getMoviesByYear', () => {
        it('should return movies for a specific year', async () => {
            const movies = [Movie.create('1', 2000, 'T', 'S', ['P'], false)];
            mockRepository.findByYear.mockResolvedValue(movies);
            const result = await movieService.getMoviesByYear(2000);
            expect(result).toEqual(movies);
        });
    });

    describe('getWinners', () => {
        it('should return winner movies', async () => {
            const winners = [Movie.create('1', 2000, 'T', 'S', ['P'], true)];
            mockRepository.findWinners.mockResolvedValue(winners);
            const result = await movieService.getWinners();
            expect(result).toEqual(winners);
        });
    });
});

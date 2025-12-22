import { InMemoryMovieRepository } from '../../../src/infrastructure/repositories/InMemoryMovieRepository';
import { Movie } from '../../../src/domain/entities/Movie';

describe('InMemoryMovieRepository', () => {
    let repository: InMemoryMovieRepository;

    beforeEach(() => {
        repository = new InMemoryMovieRepository();
    });

    describe('create and findById', () => {
        it('should create and retrieve a movie', async () => {
            const movie = Movie.create('1', 1980, 'Test Movie', 'Test Studios', ['Producer'], true);

            await repository.create(movie);
            const found = await repository.findById('1');

            expect(found).toEqual(movie);
        });
    });

    describe('findAll', () => {
        it('should return all movies', async () => {
            const movie1 = Movie.create('1', 1980, 'Movie 1', 'Studios', ['Producer'], true);
            const movie2 = Movie.create('2', 1981, 'Movie 2', 'Studios', ['Producer'], false);

            await repository.create(movie1);
            await repository.create(movie2);

            const all = await repository.findAll();

            expect(all).toHaveLength(2);
            expect(all).toContainEqual(movie1);
            expect(all).toContainEqual(movie2);
        });

        it('should return empty array when no movies', async () => {
            const all = await repository.findAll();
            expect(all).toEqual([]);
        });
    });

    describe('findByYear', () => {
        it('should find movies by year', async () => {
            const movie1 = Movie.create('1', 1980, 'Movie 1', 'Studios', ['Producer'], true);
            const movie2 = Movie.create('2', 1980, 'Movie 2', 'Studios', ['Producer'], false);
            const movie3 = Movie.create('3', 1981, 'Movie 3', 'Studios', ['Producer'], true);

            await repository.create(movie1);
            await repository.create(movie2);
            await repository.create(movie3);

            const movies1980 = await repository.findByYear(1980);

            expect(movies1980).toHaveLength(2);
            expect(movies1980).toContainEqual(movie1);
            expect(movies1980).toContainEqual(movie2);
        });
    });

    describe('findWinners', () => {
        it('should find only winner movies', async () => {
            const winner1 = Movie.create('1', 1980, 'Winner 1', 'Studios', ['Producer'], true);
            const loser = Movie.create('2', 1980, 'Loser', 'Studios', ['Producer'], false);
            const winner2 = Movie.create('3', 1981, 'Winner 2', 'Studios', ['Producer'], true);

            await repository.create(winner1);
            await repository.create(loser);
            await repository.create(winner2);

            const winners = await repository.findWinners();

            expect(winners).toHaveLength(2);
            expect(winners).toContainEqual(winner1);
            expect(winners).toContainEqual(winner2);
            expect(winners).not.toContainEqual(loser);
        });
    });

    describe('update', () => {
        it('should update an existing movie', async () => {
            const movie = Movie.create('1', 1980, 'Original', 'Studios', ['Producer'], false);
            await repository.create(movie);

            const updated = movie.update({ title: 'Updated', winner: true });
            const result = await repository.update('1', updated);

            expect(result).toEqual(updated);
            expect(result?.title).toBe('Updated');
            expect(result?.winner).toBe(true);
        });

        it('should return null when updating non-existent movie', async () => {
            const movie = Movie.create('999', 1980, 'Test', 'Studios', ['Producer'], false);
            const result = await repository.update('999', movie);

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('should delete an existing movie', async () => {
            const movie = Movie.create('1', 1980, 'Test', 'Studios', ['Producer'], false);
            await repository.create(movie);

            const deleted = await repository.delete('1');
            const found = await repository.findById('1');

            expect(deleted).toBe(true);
            expect(found).toBeNull();
        });

        it('should return false when deleting non-existent movie', async () => {
            const deleted = await repository.delete('999');
            expect(deleted).toBe(false);
        });
    });

    describe('count', () => {
        it('should return correct count', async () => {
            expect(await repository.count()).toBe(0);

            await repository.create(Movie.create('1', 1980, 'Movie 1', 'Studios', ['Producer'], true));
            expect(await repository.count()).toBe(1);

            await repository.create(Movie.create('2', 1981, 'Movie 2', 'Studios', ['Producer'], false));
            expect(await repository.count()).toBe(2);
        });
    });

    describe('bulkCreate', () => {
        it('should create multiple movies at once', async () => {
            const movies = [
                Movie.create('1', 1980, 'Movie 1', 'Studios', ['Producer'], true),
                Movie.create('2', 1981, 'Movie 2', 'Studios', ['Producer'], false),
                Movie.create('3', 1982, 'Movie 3', 'Studios', ['Producer'], true),
            ];

            await repository.bulkCreate(movies);

            expect(await repository.count()).toBe(3);
            const all = await repository.findAll();
            expect(all).toHaveLength(3);
        });
    });

    describe('clear', () => {
        it('should clear all movies', async () => {
            await repository.create(Movie.create('1', 1980, 'Movie 1', 'Studios', ['Producer'], true));
            await repository.create(Movie.create('2', 1981, 'Movie 2', 'Studios', ['Producer'], false));

            expect(await repository.count()).toBe(2);

            repository.clear();

            expect(await repository.count()).toBe(0);
            expect(await repository.findAll()).toEqual([]);
        });
    });
});

import { Service } from 'typedi';
import { Movie } from '@domain/entities/Movie';
import { IMovieRepository } from '@domain/interfaces/IMovieRepository';

@Service()
export class InMemoryMovieRepository implements IMovieRepository {
    private movies: Map<string, Movie> = new Map();

    async findAll(): Promise<Movie[]> {
        return Array.from(this.movies.values());
    }

    async findById(id: string): Promise<Movie | null> {
        return this.movies.get(id) ?? null;
    }

    async findByYear(year: number): Promise<Movie[]> {
        return Array.from(this.movies.values()).filter((movie) => movie.year === year);
    }

    async findWinners(): Promise<Movie[]> {
        return Array.from(this.movies.values()).filter((movie) => movie.winner);
    }

    async create(movie: Movie): Promise<Movie> {
        this.movies.set(movie.id, movie);
        return movie;
    }

    async update(id: string, movie: Movie): Promise<Movie | null> {
        if (!this.movies.has(id)) {
            return null;
        }
        this.movies.set(id, movie);
        return movie;
    }

    async delete(id: string): Promise<boolean> {
        return this.movies.delete(id);
    }

    async count(): Promise<number> {
        return this.movies.size;
    }

    clear(): void {
        this.movies.clear();
    }

    async bulkCreate(movies: Movie[]): Promise<void> {
        movies.forEach((movie) => {
            this.movies.set(movie.id, movie);
        });
    }
}

import { Movie } from '../entities/Movie';

export interface IMovieRepository {
    findAll(): Promise<Movie[]>;
    findById(id: string): Promise<Movie | null>;
    findByYear(year: number): Promise<Movie[]>;
    findWinners(): Promise<Movie[]>;
    create(movie: Movie): Promise<Movie>;
    update(id: string, movie: Movie): Promise<Movie | null>;
    delete(id: string): Promise<boolean>;
    count(): Promise<number>;
}

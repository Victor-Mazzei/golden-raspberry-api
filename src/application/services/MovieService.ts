import { Service, Inject } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import { Movie } from '@domain/entities/Movie';
import { IMovieRepository } from '@domain/interfaces/IMovieRepository';
import { CreateMovieDto } from '../dtos/CreateMovieDto';
import { UpdateMovieDto } from '../dtos/UpdateMovieDto';
import { Logger } from '@infrastructure/logging/Logger';

/**
 * Service providing CRUD operations and business logic for Movie resources.
 * Acts as an Orchestrator between the API layer and the Domain/Infrastructure layers.
 */
@Service()
export class MovieService {
    constructor(
        @Inject('IMovieRepository')
        private readonly movieRepository: IMovieRepository,
        @Inject()
        private readonly logger: Logger
    ) { }

    /**
     * Retrieves all movies stored in the repository.
     * @returns Promise resolving to an array of all movies
     */
    async getAllMovies(): Promise<Movie[]> {
        return this.movieRepository.findAll();
    }

    /**
     * Retrieves a single movie by its ID.
     * @param id The unique identifier of the movie
     * @throws Error if the movie is not found
     * @returns Promise resolving to the requested movie
     */
    async getMovieById(id: string): Promise<Movie> {
        const movie = await this.movieRepository.findById(id);
        if (!movie) {
            throw new Error(`Movie with id ${id} not found`);
        }
        return movie;
    }

    /**
     * Finds movies released in a specific year.
     * @param year The release year to filter by
     * @returns Promise resolving to an array of movies from that year
     */
    async getMoviesByYear(year: number): Promise<Movie[]> {
        return this.movieRepository.findByYear(year);
    }

    /**
     * Retrieves all movies that won the Golden Raspberry Award.
     * @returns Promise resolving to an array of winner movies
     */
    async getWinners(): Promise<Movie[]> {
        return this.movieRepository.findWinners();
    }

    /**
     * Creates and persists a new movie entry.
     * Automatically assigns a UUID to the new movie.
     * @param dto The data transfer object containing the movie details
     * @returns Promise resolving to the created movie
     */
    async createMovie(dto: CreateMovieDto): Promise<Movie> {
        this.logger.debug(`Creating movie: ${dto.title} (${dto.year})`);
        const producers = this.parseProducers(dto.producers);

        const movie = Movie.create(
            uuidv4(),
            dto.year,
            dto.title,
            dto.studios,
            producers,
            dto.winner
        );

        const result = await this.movieRepository.create(movie);
        this.logger.info(`Movie created successfully: ${movie.title} (ID: ${movie.id})`);
        return result;
    }

    /**
     * Updates an existing movie entry.
     * Partially updates only the fields provided in the DTO.
     * @param id The ID of the movie to update
     * @param dto The data transfer object containing update details
     * @throws Error if the movie is not found
     * @returns Promise resolving to the updated movie
     */
    async updateMovie(id: string, dto: UpdateMovieDto): Promise<Movie> {
        this.logger.debug(`Updating movie ID ${id}`, { dto });
        const existingMovie = await this.getMovieById(id);

        const producers = dto.producers ? this.parseProducers(dto.producers) : undefined;

        const updatedMovie = existingMovie.update({
            year: dto.year,
            title: dto.title,
            studios: dto.studios,
            producers,
            winner: dto.winner,
        });

        const result = await this.movieRepository.update(id, updatedMovie);
        if (!result) {
            this.logger.error(`Failed to update movie ID ${id}: Movie not found in repository`);
            throw new Error(`Failed to update movie with id ${id}`);
        }

        this.logger.info(`Movie updated successfully: ${result.title} (ID: ${id})`);
        return result;
    }

    /**
     * Deletes a movie entry from the repository.
     * @param id The ID of the movie to delete
     * @throws Error if the movie is not found
     */
    async deleteMovie(id: string): Promise<void> {
        this.logger.debug(`Deleting movie ID ${id}`);
        const deleted = await this.movieRepository.delete(id);
        if (!deleted) {
            this.logger.warn(`Attempted to delete non-existent movie ID ${id}`);
            throw new Error(`Movie with id ${id} not found`);
        }
        this.logger.info(`Movie deleted successfully (ID: ${id})`);
    }

    /**
     * Gets the total count of movies in the repository.
     * @returns Promise resolving to the count of movies
     */
    async getMovieCount(): Promise<number> {
        return this.movieRepository.count();
    }

    /**
     * Parses a raw string of producers into a trimmed array.
     * Handles separators like commas (",") and the word " and ".
     * @param producersString The raw string from the CSV or API
     * @returns Array of individual producer names
     */
    private parseProducers(producersString: string): string[] {
        // Split by comma and "and", then clean up
        return producersString
            .split(/,| and /)
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
    }
}


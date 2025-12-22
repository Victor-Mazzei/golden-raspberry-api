import { JsonController, Get, Post, Put, Delete, Param, Body, HttpCode, OnUndefined } from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { MovieService } from '@application/services/MovieService';
import { CreateMovieDto } from '@application/dtos/CreateMovieDto';
import { UpdateMovieDto } from '@application/dtos/UpdateMovieDto';
import { Movie } from '@domain/entities/Movie';
@Service()
@JsonController('/api/movies')
export class MovieController {
    constructor(
        @Inject()
        private readonly movieService: MovieService
    ) { }

    /**
     * List all movies.
     */
    @Get('/')
    @OpenAPI({ summary: 'List all movies' })
    @ResponseSchema(Movie, { isArray: true })
    async getAllMovies(): Promise<Movie[]> {
        return this.movieService.getAllMovies();
    }

    /**
     * Get movie by ID.
     */
    @Get('/:id')
    @OpenAPI({ summary: 'Get movie by ID' })
    @ResponseSchema(Movie)
    async getMovieById(@Param('id') id: string): Promise<Movie> {
        return this.movieService.getMovieById(id);
    }

    /**
     * Create a new movie.
     */
    @Post('/')
    @HttpCode(201)
    @OpenAPI({ summary: 'Create a new movie' })
    @ResponseSchema(Movie)
    async createMovie(@Body() dto: CreateMovieDto): Promise<Movie> {
        return this.movieService.createMovie(dto);
    }

    /**
     * Update a movie.
     */
    @Put('/:id')
    @OpenAPI({ summary: 'Update a movie' })
    @ResponseSchema(Movie)
    async updateMovie(@Param('id') id: string, @Body() dto: UpdateMovieDto): Promise<Movie> {
        return this.movieService.updateMovie(id, dto);
    }

    /**
     * Delete a movie.
     */
    @Delete('/:id')
    @HttpCode(204)
    @OnUndefined(204)
    @OpenAPI({ summary: 'Delete a movie' })
    async deleteMovie(@Param('id') id: string): Promise<null> {
        await this.movieService.deleteMovie(id);
        return null;
    }
}


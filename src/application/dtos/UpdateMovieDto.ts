import { IsInt, IsString, IsBoolean, Min, MaxLength, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for partially updating a movie entry.
 */
export class UpdateMovieDto {
    /**
     * The year the movie was released.
     * @example 1980
     */
    @IsOptional()
    @IsInt()
    @Min(1900)
    year?: number;

    /**
     * The title of the movie.
     * @example Howard the Duck
     */
    @IsOptional()
    @IsString()
    @MaxLength(500)
    title?: string;

    /**
     * The studio(s) that produced the movie.
     * @example Universal Pictures
     */
    @IsOptional()
    @IsString()
    @MaxLength(500)
    studios?: string;

    /**
     * The producer(s) of the movie, separated by commas or "and".
     * @example Bo Derek
     */
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    producers?: string;

    /**
     * Whether the movie won the Golden Raspberry Award.
     * @example true
     */
    @IsOptional()
    @IsBoolean()
    winner?: boolean;
}


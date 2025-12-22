import { IsInt, IsString, IsBoolean, Min, MaxLength, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for creating a new movie entry.
 */
export class CreateMovieDto {
    /**
     * The year the movie was released.
     * @example 1980
     */
    @IsInt()
    @Min(1900)
    year!: number;

    /**
     * The title of the movie.
     * @example Howard the Duck
     */
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    title!: string;

    /**
     * The studio(s) that produced the movie.
     * @example Universal Pictures
     */
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    studios!: string;

    /**
     * The producer(s) of the movie, separated by commas or "and".
     * @example Gloria Katz, Willard Huyck
     */
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    producers!: string;

    /**
     * Whether the movie won the Golden Raspberry Award.
     * @example true
     */
    @IsBoolean()
    winner!: boolean;
}


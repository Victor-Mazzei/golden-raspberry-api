/**
 * Entity representing a Movie in the Golden Raspberry Awards system.
 */
export class Movie {
    /**
     * @param id Unique identifier for the movie (UUID)
     * @param year Release year
     * @param title Movie title
     * @param studios Production studios
     * @param producers List of producers
     * @param winner Whether the movie won the award
     */
    constructor(
        public readonly id: string,
        public year: number,
        public title: string,
        public studios: string,
        public producers: string[],
        public winner: boolean
    ) { }

    /**
     * Factory method for creating a new Movie instance.
     */
    static create(
        id: string,
        year: number,
        title: string,
        studios: string,
        producers: string[],
        winner: boolean
    ): Movie {
        return new Movie(id, year, title, studios, producers, winner);
    }

    /**
     * Creates a new Movie instance with updated properties (Immutable update).
     * @param data Partial movie data to update
     * @returns A new Movie instance with updated data
     */
    update(data: Partial<Omit<Movie, 'id'>>): Movie {
        return new Movie(
            this.id,
            data.year ?? this.year,
            data.title ?? this.title,
            data.studios ?? this.studios,
            data.producers ?? this.producers,
            data.winner ?? this.winner
        );
    }
}


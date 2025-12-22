/**
 * Structure representing a single win for a producer.
 */
export interface ProducerWin {
    year: number;
    title: string;
}

/**
 * Entity representing a Producer and their collection of wins.
 */
export class Producer {
    /**
     * @param name Unique name of the producer
     * @param wins Collection of award wins for this producer
     */
    constructor(
        public readonly name: string,
        public readonly wins: ProducerWin[]
    ) { }

    /**
     * Factory method for creating a Producer.
     */
    static create(name: string, wins: ProducerWin[] = []): Producer {
        return new Producer(name, wins);
    }

    /**
     * Creates a new Producer instance with an additional win.
     * @param year Year of the win
     * @param title Title of the movie
     * @returns A new Producer instance
     */
    addWin(year: number, title: string): Producer {
        return new Producer(this.name, [...this.wins, { year, title }]);
    }

    /**
     * Returns the years of all wins, sorted chronologically.
     * @returns Sorted array of win years
     */
    getWinYears(): number[] {
        return this.wins.map((win) => win.year).sort((a, b) => a - b);
    }
}


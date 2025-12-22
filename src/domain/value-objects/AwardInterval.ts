/**
 * Value Object representing the interval between two consecutive award wins for a producer.
 */
export class AwardInterval {
    /**
     * @param producer Name of the producer
     * @param interval Difference in years between followingWin and previousWin
     * @param previousWin Year of the first win in the interval
     * @param followingWin Year of the second win in the interval
     */
    constructor(
        public readonly producer: string,
        public readonly interval: number,
        public readonly previousWin: number,
        public readonly followingWin: number
    ) { }

    /**
     * Factory method for creating an AwardInterval with validation.
     * @throws Error if interval is negative or if win years are logically inconsistent
     */
    static create(
        producer: string,
        interval: number,
        previousWin: number,
        followingWin: number
    ): AwardInterval {
        if (interval < 0) {
            throw new Error('Interval cannot be negative');
        }
        if (previousWin >= followingWin) {
            throw new Error('Previous win must be before following win');
        }
        return new AwardInterval(producer, interval, previousWin, followingWin);
    }
}


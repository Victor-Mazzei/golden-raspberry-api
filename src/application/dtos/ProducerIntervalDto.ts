/**
 * Represents a single producer award interval.
 */
export class ProducerIntervalItem {
    /**
     * Name of the producer.
     * @example Bo Derek
     */
    producer!: string;

    /**
     * Interval in years between consecutive wins.
     * @example 6
     */
    interval!: number;

    /**
     * Year of the first win in the interval.
     * @example 1984
     */
    previousWin!: number;

    /**
     * Year of the subsequent win in the interval.
     * @example 1990
     */
    followingWin!: number;
}

/**
 * API response structure for producer award intervals.
 */
export class ProducerIntervalsResponse {
    /**
     * List of producers with the minimum interval between wins.
     */
    min!: ProducerIntervalItem[];

    /**
     * List of producers with the maximum interval between wins.
     */
    max!: ProducerIntervalItem[];
}

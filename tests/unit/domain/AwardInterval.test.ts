import { AwardInterval } from '@domain/value-objects/AwardInterval';

describe('AwardInterval', () => {
    describe('create', () => {
        it('should create a valid AwardInterval', () => {
            const interval = AwardInterval.create('Producer', 5, 1980, 1985);
            expect(interval.producer).toBe('Producer');
            expect(interval.interval).toBe(5);
        });

        it('should throw error if interval is negative', () => {
            expect(() => AwardInterval.create('Producer', -1, 1980, 1985))
                .toThrow('Interval cannot be negative');
        });

        it('should throw error if previousWin is not before followingWin', () => {
            expect(() => AwardInterval.create('Producer', 5, 1985, 1980))
                .toThrow('Previous win must be before following win');

            expect(() => AwardInterval.create('Producer', 0, 1980, 1980))
                .toThrow('Previous win must be before following win');
        });
    });
});

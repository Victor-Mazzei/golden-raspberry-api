import { Movie } from '@domain/entities/Movie';
import { Producer } from '@domain/entities/Producer';

describe('Domain Entities Coverage', () => {
    describe('Movie', () => {
        it('should update movie with partial data', () => {
            const movie = Movie.create('1', 1980, 'T', 'S', ['P'], true);
            const updated = movie.update({ title: 'New T' });

            expect(updated.title).toBe('New T');
            expect(updated.year).toBe(1980);
            expect(updated.id).toBe('1');
        });

        it('should handle all branches in update', () => {
            const movie = Movie.create('1', 1980, 'T', 'S', ['P'], true);
            const updated = movie.update({
                year: 1981,
                title: 'T2',
                studios: 'S2',
                producers: ['P2'],
                winner: false
            });
            expect(updated.year).toBe(1981);
            expect(updated.title).toBe('T2');
            expect(updated.studios).toBe('S2');
            expect(updated.producers).toEqual(['P2']);
            expect(updated.winner).toBe(false);
        });
    });

    describe('Producer', () => {
        it('should create producer with default empty wins', () => {
            const producer = Producer.create('Name');
            expect(producer.wins).toEqual([]);
        });

        it('should add win to producer', () => {
            const producer = Producer.create('Name');
            const updated = producer.addWin(1980, 'Title');
            expect(updated.wins).toHaveLength(1);
            expect(updated.wins[0].year).toBe(1980);
        });

        it('should get sorted win years', () => {
            const producer = Producer.create('Name', [
                { year: 1990, title: 'T1' },
                { year: 1980, title: 'T2' }
            ]);
            expect(producer.getWinYears()).toEqual([1980, 1990]);
        });
    });
});

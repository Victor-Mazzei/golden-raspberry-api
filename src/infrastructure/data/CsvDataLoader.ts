import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Service } from 'typedi';
import { Movie } from '@domain/entities/Movie';
import { Logger } from '../logging/Logger';


@Service()
export class CsvDataLoader {
    constructor(private readonly logger: Logger) { }

    async loadMoviesFromCsv(filePath: string): Promise<Movie[]> {
        this.logger.info(`Loading movies from CSV: ${filePath}`);

        const absolutePath = path.resolve(filePath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`CSV file not found: ${absolutePath}`);
        }

        const fileContent = fs.readFileSync(absolutePath, 'utf-8');
        const lines = fileContent.split('\n').filter((line) => line.trim().length > 0);

        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        const header = lines[0].split(';');
        const expectedHeaders = ['year', 'title', 'studios', 'producers', 'winner'];

        if (!this.validateHeaders(header, expectedHeaders)) {
            throw new Error(`Invalid CSV headers. Expected: ${expectedHeaders.join(', ')}`);
        }

        const movies: Movie[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i += 1) {
            try {
                const movie = this.parseCsvRow(lines[i]);
                if (movie) {
                    movies.push(movie);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Line ${i + 1}: ${errorMessage}`);
                this.logger.warn(`Failed to parse line ${i + 1}: ${errorMessage}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Failed to parse CSV file. ${errors.length} invalid rows found:\n${errors.join('\n')}`);
        }

        this.logger.info(`Successfully loaded ${movies.length} movies from CSV`);

        return movies;
    }

    private validateHeaders(actual: string[], expected: string[]): boolean {
        if (actual.length !== expected.length) {
            return false;
        }
        return expected.every((header, index) => actual[index].toLowerCase() === header.toLowerCase());
    }

    private parseCsvRow(line: string): Movie | null {
        const columns = line.split(';');

        if (columns.length !== 5) {
            throw new Error(`Expected 5 columns, got ${columns.length}`);
        }

        const [yearStr, title, studios, producersStr, winnerStr] = columns;

        const year = parseInt(yearStr.trim(), 10);
        if (Number.isNaN(year) || year < 1900 || year > 2100) {
            throw new Error(`Invalid year: ${yearStr}`);
        }

        if (!title || title.trim().length === 0) {
            throw new Error('Title is required');
        }

        if (!studios || studios.trim().length === 0) {
            throw new Error('Studios is required');
        }

        const producers = this.parseProducers(producersStr);
        if (producers.length === 0) {
            throw new Error('At least one producer is required');
        }

        const winner = winnerStr.trim().toLowerCase() === 'yes';

        return Movie.create(
            uuidv4(),
            year,
            title.trim(),
            studios.trim(),
            producers,
            winner
        );
    }

    private parseProducers(producersStr: string): string[] {
        if (!producersStr || producersStr.trim().length === 0) {
            return [];
        }

        // Split by comma and "and", handling various formats
        return producersStr
            .split(/,| and /)
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
    }
}

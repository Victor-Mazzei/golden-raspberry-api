import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { CsvDataLoader } from '@infrastructure/data/CsvDataLoader';
import { Logger } from '@infrastructure/logging/Logger';

jest.mock('@infrastructure/logging/Logger');

describe('CsvDataLoader', () => {
    let loader: CsvDataLoader;
    let logger: jest.Mocked<Logger>;

    beforeEach(() => {
        logger = new Logger() as jest.Mocked<Logger>;
        loader = new CsvDataLoader(logger);
    });

    describe('loadMoviesFromCsv', () => {
        const testCsvPath = path.resolve(__dirname, 'test.csv');

        afterEach(() => {
            if (fs.existsSync(testCsvPath)) {
                fs.unlinkSync(testCsvPath);
            }
        });

        it('should throw error if file does not exist', async () => {
            await expect(loader.loadMoviesFromCsv('non-existent.csv'))
                .rejects.toThrow('CSV file not found');
        });

        it('should throw error if file is empty', async () => {
            fs.writeFileSync(testCsvPath, '');
            await expect(loader.loadMoviesFromCsv(testCsvPath))
                .rejects.toThrow('CSV file is empty');
        });

        it('should throw error if headers are invalid', async () => {
            fs.writeFileSync(testCsvPath, 'year;title;studios;producers\nyes');
            await expect(loader.loadMoviesFromCsv(testCsvPath))
                .rejects.toThrow('Invalid CSV headers');
        });

        it('should throw error if any row has invalid year', async () => {
            const content = 'year;title;studios;producers;winner\ninvalid;Movie;Studio;Producer;yes\n1980;Valid Movie;Studio;Producer;no';
            fs.writeFileSync(testCsvPath, content);

            await expect(loader.loadMoviesFromCsv(testCsvPath))
                .rejects.toThrow('Failed to parse CSV file. 1 invalid rows found');
        });

        it('should throw error if title is missing', async () => {
            const content = 'year;title;studios;producers;winner\n1980;;Studio;Producer;yes\n1981;Valid Movie;Studio;Producer;no';
            fs.writeFileSync(testCsvPath, content);

            await expect(loader.loadMoviesFromCsv(testCsvPath))
                .rejects.toThrow('Failed to parse CSV file');
        });

        it('should throw error if studios are missing', async () => {
            const content = 'year;title;studios;producers;winner\n1980;Title;;Producer;yes\n1981;Valid Movie;Studio;Producer;no';
            fs.writeFileSync(testCsvPath, content);

            await expect(loader.loadMoviesFromCsv(testCsvPath))
                .rejects.toThrow('Failed to parse CSV file');
        });

        it('should throw error if producers are missing', async () => {
            const content = 'year;title;studios;producers;winner\n1980;Title;Studio;;yes\n1981;Valid Movie;Studio;Producer;no';
            fs.writeFileSync(testCsvPath, content);

            await expect(loader.loadMoviesFromCsv(testCsvPath))
                .rejects.toThrow('Failed to parse CSV file');
        });

        it('should throw error if all rows are invalid', async () => {
            const content = 'year;title;studios;producers;winner\ninvalid;Movie;Studio;Producer;yes';
            fs.writeFileSync(testCsvPath, content);


            await expect(loader.loadMoviesFromCsv(testCsvPath))
                .rejects.toThrow('Failed to parse CSV file');
        });

        it('should handle rows with wrong column count', async () => {
            const content = 'year;title;studios;producers;winner\n1980;Only;Three;Columns';
            fs.writeFileSync(testCsvPath, content);

            await expect(loader.loadMoviesFromCsv(testCsvPath))
                .rejects.toThrow('Failed to parse CSV file');
        });

        it('should correctly reject the provided sample error file', async () => {
            const errorFilePath = path.resolve(__dirname, '../../../data/Movielist_with_errors.csv');

            await expect(loader.loadMoviesFromCsv(errorFilePath))
                .rejects.toThrow('Failed to parse CSV file');
        });
    });
});

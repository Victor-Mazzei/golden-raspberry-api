import { ErrorHandler } from '@presentation/middleware/ErrorHandler';
import { Request, Response } from 'express';
import { Logger } from '@infrastructure/logging/Logger';

describe('ErrorHandler', () => {
    let errorHandler: ErrorHandler;
    let mockLogger: jest.Mocked<Logger>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let next: jest.Mock;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        mockLogger = {
            error: jest.fn(),
            debug: jest.fn(),
        } as any;
        errorHandler = new ErrorHandler(mockLogger);
        mockRequest = {
            method: 'GET',
            path: '/test',
            body: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should handle standard 500 error', () => {
        const error = new Error('Generic error');
        errorHandler.error(error, mockRequest as Request, mockResponse as Response, next);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.objectContaining({ message: 'Generic error' })
        }));
    });

    it('should handle "not found" error with 404', () => {
        const error = new Error('User not found');
        errorHandler.error(error, mockRequest as Request, mockResponse as Response, next);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle validation errors with 400', () => {
        const error: any = new Error('Validation error');
        error.errors = [
            { constraints: { required: 'title is required' } },
            { constraints: { min: 'year too low' } }
        ];
        errorHandler.error(error, mockRequest as Request, mockResponse as Response, next);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.objectContaining({
                message: expect.stringContaining('Validation failed')
            })
        }));
    });

    it('should handle BadRequestError', () => {
        const error = new Error('Bad request');
        error.name = 'BadRequestError';
        errorHandler.error(error, mockRequest as Request, mockResponse as Response, next);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle SyntaxError with JSON message', () => {
        const error = new Error('Unexpected token in JSON');
        error.name = 'SyntaxError';
        errorHandler.error(error, mockRequest as Request, mockResponse as Response, next);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.objectContaining({ message: 'Invalid JSON in request body' })
        }));
    });

    it('should include stack trace in development', () => {
        process.env.NODE_ENV = 'development';
        const error = new Error('Debug me');
        errorHandler.error(error, mockRequest as Request, mockResponse as Response, next);

        const call = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(call.error).toHaveProperty('stack');
    });

    it('should respect httpCode property', () => {
        const error: any = new Error('Custom error');
        error.httpCode = 418;
        errorHandler.error(error, mockRequest as Request, mockResponse as Response, next);
        expect(mockResponse.status).toHaveBeenCalledWith(418);
    });
});

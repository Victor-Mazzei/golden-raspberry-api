import { Container } from 'typedi';
import { InMemoryMovieRepository } from '@infrastructure/repositories/InMemoryMovieRepository';

export function setupContainer(): void {
    // Register repository implementation
    const movieRepository = Container.get(InMemoryMovieRepository);
    Container.set('IMovieRepository', movieRepository);
}

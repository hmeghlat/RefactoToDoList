import { TodoRepository } from './TodoRepository';

export interface InMemoryRepository extends TodoRepository {
    init(): Promise<void>;
    teardown(): Promise<void>;
}

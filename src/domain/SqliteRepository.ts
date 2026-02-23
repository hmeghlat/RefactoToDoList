import { TodoRepository } from './TodoRepository';

export interface SqliteRepository extends TodoRepository {
    init(): Promise<void>;
    teardown(): Promise<void>;
}

import { TodoItem } from './TodoItem';

export interface TodoRepository {
    getItems(): Promise<TodoItem[]>;
    getItem(id: string): Promise<TodoItem>;
    storeItem(item: TodoItem): Promise<void>;
    updateItem(id: string, item: Partial<TodoItem>): Promise<void>;
    removeItem(id: string): Promise<void>;
}

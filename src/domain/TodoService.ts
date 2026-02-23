import { v4 as uuid } from 'uuid';
import { TodoItem } from './TodoItem';
import { TodoRepository } from './TodoRepository';

export class TodoService {
    constructor(private repository: TodoRepository) {}

    async getItems(): Promise<TodoItem[]> {
        return this.repository.getItems();
    }

    async getItem(id: string): Promise<TodoItem> {
        return this.repository.getItem(id);
    }

    async addItem(name: string): Promise<TodoItem> {
        const item: TodoItem = {
            id: uuid(),
            name,
            completed: false,
        };
        await this.repository.storeItem(item);
        return item;
    }

    async updateItem(id: string, data: Partial<TodoItem>): Promise<TodoItem> {
        await this.repository.updateItem(id, data);
        return this.repository.getItem(id);
    }

    async removeItem(id: string): Promise<void> {
        await this.repository.removeItem(id);
    }
}

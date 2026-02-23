import { TodoItem } from '../../domain/TodoItem';
import { InMemoryRepository } from '../../domain/InMemoryRepository';

const items: Map<string, TodoItem> = new Map();

async function init(): Promise<void> {}

async function teardown(): Promise<void> {
    items.clear();
}

async function getItems(): Promise<TodoItem[]> {
    return Array.from(items.values());
}

async function getItem(id: string): Promise<TodoItem> {
    const item = items.get(id);
    if (!item) throw new Error(`Item ${id} not found`);
    return item;
}

async function storeItem(item: TodoItem): Promise<void> {
    items.set(item.id, item);
}

async function updateItem(id: string, data: Partial<TodoItem>): Promise<void> {
    const existing = await getItem(id);
    items.set(id, { ...existing, ...data });
}

async function removeItem(id: string): Promise<void> {
    items.delete(id);
}

const repository: InMemoryRepository = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};

export = repository;

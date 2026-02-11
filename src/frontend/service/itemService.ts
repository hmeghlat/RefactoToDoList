import { Item } from '../interface/Item';

export async function getItems(): Promise<Item[]> {
    const response = await fetch('/items');
    return response.json();
}

export async function addItem(name: string): Promise<Item> {
    const response = await fetch('/items', {
        method: 'POST',
        body: JSON.stringify({ name }),
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
}

export async function updateItem(item: Item): Promise<Item> {
    const response = await fetch(`/items/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            name: item.name,
            completed: !item.completed,
        }),
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
}

export async function deleteItem(id: string): Promise<void> {
    await fetch(`/items/${id}`, { method: 'DELETE' });
}

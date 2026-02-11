import React from 'react';
import AddItemForm from './AddItemForm';
import ItemDisplay from './ItemDisplay';
import { Item } from '../interface/Item';
import { getItems } from '../service/itemService';

export default function TodoListCard() {
    const [items, setItems] = React.useState<Item[] | null>(null);

    React.useEffect(() => {
        getItems().then(setItems);
    }, []);

    const onNewItem = React.useCallback(
        (newItem: Item) => {
            setItems([...items!, newItem]);
        },
        [items],
    );

    const onItemUpdate = React.useCallback(
        (item: Item) => {
            const index = items!.findIndex(i => i.id === item.id);
            setItems([
                ...items!.slice(0, index),
                item,
                ...items!.slice(index + 1),
            ]);
        },
        [items],
    );

    const onItemRemoval = React.useCallback(
        (item: Item) => {
            const index = items!.findIndex(i => i.id === item.id);
            setItems([...items!.slice(0, index), ...items!.slice(index + 1)]);
        },
        [items],
    );

    if (items === null) return <p>Loading...</p>;

    return (
        <>
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center">No items yet! Add one above!</p>
            )}
            {items.map(item => (
                <ItemDisplay
                    item={item}
                    key={item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </>
    );
}
import { Item } from './Item';

export interface ItemDisplayProps {
    item: Item;
    onItemUpdate: (item: Item) => void;
    onItemRemoval: (item: Item) => void;
}
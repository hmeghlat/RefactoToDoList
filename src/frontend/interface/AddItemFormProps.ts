import { Item } from './Item';

export interface AddItemFormProps {
    onNewItem: (item: Item) => void;
}

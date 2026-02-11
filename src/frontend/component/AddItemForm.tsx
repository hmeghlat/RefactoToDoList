import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { AddItemFormProps } from '../interface/AddItemFormProps';
import { addItem } from '../service/itemService';

export default function AddItemForm({ onNewItem }: AddItemFormProps) {
    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        addItem(newItem).then(item => {
            onNewItem(item);
            setSubmitting(false);
            setNewItem('');
        });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <Button
                    type="submit"
                    variant="success"
                    disabled={!newItem.length}
                    className={submitting ? 'disabled' : ''}
                >
                    {submitting ? 'Adding...' : 'Add Item'}
                </Button>
            </InputGroup>
        </Form>
    );
}
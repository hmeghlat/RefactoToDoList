import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ItemDisplayProps } from '../interface/ItemDisplayProps';
import { updateItem, deleteItem } from '../service/itemService';

export default function ItemDisplay({ item, onItemUpdate, onItemRemoval }: ItemDisplayProps) {
    const toggleCompletion = () => {
        updateItem(item).then(onItemUpdate);
    };

    const removeItem = () => {
        deleteItem(item.id).then(() => onItemRemoval(item));
    };

    return (
        <Container fluid className={`item ${item.completed ? 'completed' : ''}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        aria-label={
                            item.completed
                                ? 'Mark item as incomplete'
                                : 'Mark item as complete'
                        }
                    >
                        <i
                            className={`far ${
                                item.completed ? 'fa-check-square' : 'fa-square'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={10} className="name">
                    {item.name}
                </Col>
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}
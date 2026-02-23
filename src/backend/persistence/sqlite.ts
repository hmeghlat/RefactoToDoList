import { TodoItem } from '../../domain/TodoItem';
import { SqliteRepository } from '../../domain/SqliteRepository';

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const dbLocation = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';

let db, dbAll, dbRun;

function init() {
    const dirName = require('path').dirname(dbLocation);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    return new Promise<void>((resolve, rej) => {
        db = new sqlite3.Database(dbLocation, err => {
            if (err) return rej(err);

            if (process.env.NODE_ENV !== 'test')
                console.log(`Using sqlite database at ${dbLocation}`);

            db.run(
                'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean)',
                (err, result) => {
                    if (err) return rej(err);
                    resolve();
                },
            );
        });
    });
}

async function teardown() {
    return new Promise<void>((resolve, rej) => {
        db.close(err => {
            if (err) rej(err);
            else resolve();
        });
    });
}

async function getItems(): Promise<TodoItem[]> {
    return new Promise((resolve, rej) => {
        db.all('SELECT * FROM todo_items', (err, rows) => {
            if (err) return rej(err);
            resolve(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                ),
            );
        });
    });
}

async function getItem(id: string): Promise<TodoItem> {
    return new Promise((resolve, rej) => {
        db.all('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
            if (err) return rej(err);
            resolve(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                )[0],
            );
        });
    });
}

async function storeItem(item: TodoItem): Promise<void> {
    return new Promise<void>((resolve, rej) => {
        db.run(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            err => {
                if (err) return rej(err);
                resolve();
            },
        );
    });
}

async function updateItem(id: string, item: Partial<TodoItem>): Promise<void> {
    return new Promise<void>((resolve, rej) => {
        db.run(
            'UPDATE todo_items SET name=?, completed=? WHERE id = ?',
            [item.name, item.completed ? 1 : 0, id],
            err => {
                if (err) return rej(err);
                resolve();
            },
        );
    });
} 

async function removeItem(id: string): Promise<void> {
    return new Promise<void>((resolve, rej) => {
        db.run('DELETE FROM todo_items WHERE id = ?', [id], err => {
            if (err) return rej(err);
            resolve();
        });
    });
}

const repository: SqliteRepository = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};

export = repository;

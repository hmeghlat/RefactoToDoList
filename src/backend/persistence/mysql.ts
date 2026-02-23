import waitPort = require('wait-port');
import fs = require('fs');
import mysql = require('mysql2');
import { TodoItem } from '../../domain/TodoItem';
import { TodoRepository } from '../../domain/TodoRepository';


const {
    MYSQL_HOST: HOST,
    MYSQL_HOST_FILE: HOST_FILE,
    MYSQL_USER: USER,
    MYSQL_USER_FILE: USER_FILE,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
    MYSQL_DB_FILE: DB_FILE,
} = process.env;

let pool;

async function init() {
    const host = HOST_FILE ? fs.readFileSync(HOST_FILE).toString() : HOST;
    const user = USER_FILE ? fs.readFileSync(USER_FILE).toString() : USER;
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE).toString() : PASSWORD;
    const database = DB_FILE ? fs.readFileSync(DB_FILE).toString() : DB;

    await waitPort({
        host,
        port: 3306,
        timeout: 10000,
        waitForDns: true,
    });

    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        user,
        password,
        database,
        charset: 'utf8mb4',
    });

    return new Promise<void>((resolve, reject) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean) DEFAULT CHARSET utf8mb4',
            (err) => {
                if (err) return reject(err);

                console.log(`Connected to mysql db at host ${HOST}`);
            resolve();
            },
        );
    });
}

async function teardown() {
    return new Promise<void>((resolve, reject) => {
        pool.end((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function getItems(): Promise<TodoItem[]> {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM todo_items', (err, rows) => {
            if (err) return reject(err);
            resolve(
                rows.map((item) =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                ),
            );
        });
    });
}

async function getItem(id: string): Promise<TodoItem> {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
            if (err) return reject(err);
            resolve(
                rows.map((item) =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                )[0],
            );
        });
    });
}

async function storeItem(item: TodoItem): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            (err) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function updateItem(id: string, item: Partial<TodoItem>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        pool.query(
            'UPDATE todo_items SET name=?, completed=? WHERE id=?',
            [item.name, item.completed ? 1 : 0, id],
            (err) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function removeItem(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        pool.query('DELETE FROM todo_items WHERE id = ?', [id], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

const repository: TodoRepository & { init: typeof init; teardown: typeof teardown } = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};

export = repository;

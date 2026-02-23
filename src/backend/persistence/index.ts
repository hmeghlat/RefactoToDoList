import { TodoRepository } from '../../domain/TodoRepository';

const impl: TodoRepository & { init(): Promise<void>; teardown(): Promise<void> } =
    process.env.MYSQL_HOST ? require('./mysql') : require('./sqlite');

export = impl;

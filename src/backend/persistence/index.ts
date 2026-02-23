import { SqliteRepository } from '../../domain/SqliteRepository';
import { InMemoryRepository } from '../../domain/InMemoryRepository';

type PersistenceRepository = SqliteRepository | InMemoryRepository;

let impl: PersistenceRepository;

if (process.env.NODE_ENV === 'test') {
    impl = require('./inMemory');
} else if (process.env.MYSQL_HOST) {
    impl = require('./mysql');
} else {
    impl = require('./sqlite');
}

export = impl;

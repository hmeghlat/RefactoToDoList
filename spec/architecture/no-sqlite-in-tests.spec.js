'use strict';

const path = require('path');
const fs = require('fs');

const SRC = path.resolve(__dirname, '../../src');

function readSrc(relativePath) {
    return fs.readFileSync(path.join(SRC, relativePath), 'utf-8');
}

function listTsFiles(dir) {
    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.ts'))
        .map(f => path.join(dir, f));
}

// ---------------------------------------------------------------------------
// 1. Sélection de l'implémentation selon l'environnement
// ---------------------------------------------------------------------------
describe('Architecture — sélection de la persistence selon l\'environnement', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test('NODE_ENV vaut "test" pendant l\'exécution des tests', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });

    test('persistence/index charge InMemory et non SQLite quand NODE_ENV=test', () => {
        const db = require('../../src/backend/persistence');
        const inMemory = require('../../src/backend/persistence/inMemory');

        expect(db).toBe(inMemory);
    });

    test('sqlite3 n\'est pas présent dans le cache de modules après chargement de la persistence', () => {
        require('../../src/backend/persistence');

        const sqlite3Loaded = Object.keys(require.cache).some(
            key => key.includes(`${path.sep}sqlite3${path.sep}`),
        );

        expect(sqlite3Loaded).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// 2. Isolation de sqlite3 — seul sqlite.ts peut l'importer
// ---------------------------------------------------------------------------
describe('Architecture — isolation de sqlite3', () => {
    test('seul sqlite.ts est autorisé à importer sqlite3 dans la couche persistence', () => {
        const persistenceDir = path.join(SRC, 'backend/persistence');
        const files = listTsFiles(persistenceDir).filter(f => !f.endsWith('sqlite.ts'));

        for (const file of files) {
            const source = fs.readFileSync(file, 'utf-8');
            expect(source).not.toMatch(/sqlite3/, `${path.basename(file)} ne doit pas importer sqlite3`);
        }
    });
});

// ---------------------------------------------------------------------------
// 3. Isolation du domaine — src/domain/ n'importe jamais depuis src/backend/
// ---------------------------------------------------------------------------
describe('Architecture — isolation du domaine', () => {
    test('les fichiers src/domain/ n\'importent pas depuis src/backend/', () => {
        const domainDir = path.join(SRC, 'domain');
        const files = listTsFiles(domainDir);

        for (const file of files) {
            const source = fs.readFileSync(file, 'utf-8');
            expect(source).not.toMatch(
                /from\s+['"].*backend.*['"]/,
                `${path.basename(file)} ne doit pas importer depuis backend`,
            );
        }
    });
});

// ---------------------------------------------------------------------------
// 4. Contrat des repositories — toute implémentation expose les méthodes requises
// ---------------------------------------------------------------------------
describe('Architecture — contrat des repositories', () => {
    const REQUIRED_METHODS = [
        'init',
        'teardown',
        'getItems',
        'getItem',
        'storeItem',
        'updateItem',
        'removeItem',
    ];

    beforeEach(() => {
        jest.resetModules();
    });

    test('InMemoryRepository implémente toutes les méthodes requises', () => {
        const repo = require('../../src/backend/persistence/inMemory');

        for (const method of REQUIRED_METHODS) {
            expect(typeof repo[method]).toBe('function');
        }
    });

    test('toute nouvelle implémentation dans persistence/ expose les méthodes requises', () => {
        const persistenceDir = path.join(SRC, 'backend/persistence');
        const implFiles = listTsFiles(persistenceDir).filter(
            f => !path.basename(f).startsWith('index'),
        );

        for (const file of implFiles) {
            jest.resetModules();
            const repo = require(file.replace(/\.ts$/, ''));

            for (const method of REQUIRED_METHODS) {
                expect(typeof repo[method]).toBe(
                    'function',
                    `${path.basename(file)} doit exposer la méthode "${method}"`,
                );
            }
        }
    });
});

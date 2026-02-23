'use strict';

const path = require('path');
const fs = require('fs');

/**
 * Tests de non-régression structurelle.
 *
 * Ces tests garantissent que :
 *  - sqlite3 n'est jamais chargé en environnement de test
 *  - la couche persistence sélectionne InMemory quand NODE_ENV=test
 *
 * Si l'un de ces tests échoue, c'est qu'une régression architecturale
 * a été introduite (ex : ajout d'un import sqlite3 dans inMemory.ts,
 * modification de la logique de sélection dans persistence/index.ts).
 */
describe('Architecture — pas de SQLite en environnement de test', () => {
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

    test('le fichier inMemory.ts ne contient aucun import de sqlite3', () => {
        const source = fs.readFileSync(
            path.resolve(__dirname, '../../src/backend/persistence/inMemory.ts'),
            'utf-8',
        );

        expect(source).not.toMatch(/sqlite3/);
    });
});

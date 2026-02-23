/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-db-in-domain',
            comment:
                'Le domain ne doit pas dependre de la couche persistence (base de donnees).',
            severity: 'error',
            from: { path: '^src/domain' },
            to: { path: '^src/backend/persistence' },
        },
        {
            name: 'no-circular',
            comment: 'Les dependances circulaires sont interdites.',
            severity: 'error',
            from: {},
            to: { circular: true },
        },
    ],
    options: {
        doNotFollow: {
            path: 'node_modules',
        },
        tsConfig: {
            fileName: 'tsconfig.json',
        },
        enhancedResolveOptions: {
            exportsFields: ['exports'],
            conditionNames: ['import', 'require', 'node', 'default'],
        },
    },
};

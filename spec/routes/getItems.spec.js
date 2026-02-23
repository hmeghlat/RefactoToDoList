const ITEMS = [{ id: 12345 }];

jest.mock('../../src/domain/TodoService', () => ({
    TodoService: jest.fn().mockImplementation(() => ({
        getItems: jest.fn(),
    })),
}));

const { TodoService } = require('../../src/domain/TodoService');
const getItems = require('../../src/backend/routes/getItems');

test('it gets items correctly', async () => {
    const service = new TodoService();
    const req = {};
    const res = { send: jest.fn() };
    service.getItems.mockReturnValue(Promise.resolve(ITEMS));

    await getItems(service)(req, res);

    expect(service.getItems.mock.calls.length).toBe(1);
    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(ITEMS);
});

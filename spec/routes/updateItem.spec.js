const ITEM = { id: 12345 };

jest.mock('../../src/domain/TodoService', () => ({
    TodoService: jest.fn().mockImplementation(() => ({
        updateItem: jest.fn(),
    })),
}));

const { TodoService } = require('../../src/domain/TodoService');
const updateItem = require('../../src/backend/routes/updateItem');

test('it updates items correctly', async () => {
    const req = {
        params: { id: 1234 },
        body: { name: 'New title', completed: false },
    };
    const res = { send: jest.fn() };

    const service = new TodoService();
    service.updateItem.mockReturnValue(Promise.resolve(ITEM));

    await updateItem(service)(req, res);

    expect(service.updateItem.mock.calls.length).toBe(1);
    expect(service.updateItem.mock.calls[0][0]).toBe(req.params.id);
    expect(service.updateItem.mock.calls[0][1]).toEqual({
        name: 'New title',
        completed: false,
    });

    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(ITEM);
});

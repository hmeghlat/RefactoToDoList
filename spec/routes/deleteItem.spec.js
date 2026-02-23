jest.mock('../../src/domain/TodoService', () => ({
    TodoService: jest.fn().mockImplementation(() => ({
        removeItem: jest.fn(),
    })),
}));

const { TodoService } = require('../../src/domain/TodoService');
const deleteItem = require('../../src/backend/routes/deleteItem');

test('it removes item correctly', async () => {
    const req = { params: { id: 12345 } };
    const res = { sendStatus: jest.fn() };

    const service = new TodoService();
    service.removeItem.mockReturnValue(Promise.resolve());

    await deleteItem(service)(req, res);

    expect(service.removeItem.mock.calls.length).toBe(1);
    expect(service.removeItem.mock.calls[0][0]).toBe(req.params.id);
    expect(res.sendStatus.mock.calls[0].length).toBe(1);
    expect(res.sendStatus.mock.calls[0][0]).toBe(200);
});

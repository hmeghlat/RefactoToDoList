import { TodoService } from '../domain/TodoService';

export = (todoService: TodoService) => async (req: any, res: any) => {
    const item = await todoService.updateItem(req.params.id, {
        name: req.body.name,
        completed: req.body.completed,
    });
    res.send(item);
};

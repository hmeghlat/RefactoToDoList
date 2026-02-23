import { TodoService } from '../../domain/TodoService';

export = (todoService: TodoService) => async (req: any, res: any) => {
    await todoService.removeItem(req.params.id);
    res.sendStatus(200);
};

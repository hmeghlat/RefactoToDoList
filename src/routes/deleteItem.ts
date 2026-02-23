import db = require('../backend/persistence');

export = async (req: any, res: any) => {
    await db.removeItem(req.params.id);
    res.sendStatus(200);
};

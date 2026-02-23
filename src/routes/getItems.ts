import db = require('../backend/persistence');

export = async (req: any, res: any) => {
    const items = await db.getItems();
    res.send(items);
};

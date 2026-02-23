const impl = process.env.MYSQL_HOST ? require('./mysql') : require('./sqlite');

export = impl;

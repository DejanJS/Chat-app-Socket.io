const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:yourpassgoeshere@localhost:5432/Chat');
module.exports = {pgp,db};

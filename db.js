const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:grimftw@localhost:5432/Chat');
module.exports = {pgp,db};
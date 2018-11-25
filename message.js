const db = require('./db.js').db;
const User = require('./user.js');
module.exports = class Message{
    static async insert(user, msg) {
        var id = await User.getId(user);
        await db.none('INSERT INTO Messages(UserId,text,timestamp) VALUES($1,$2,current_timestamp)', [id, msg])
    }
    static async get() {
        return await db.any(`
        SELECT 
            Messages.id,
            Users.username,
            Messages.text,
            Messages.timestamp
        FROM Messages JOIN Users ON Users.id = Messages.UserId
        `)
    }
}

const Security = require('./security.js');
const db = require('./db.js').db;
module.exports = class User {
    static async printAll(){ //getUser();
        try {
            var data = await db.any('SELECT username FROM Users');
            data.map((usr, i) => {
                console.log(usr.username)
            })
        } catch (e) {
            console.log("there was an error : ", e);
        }
    }
    static async insert(name, pass) {
        console.log("insert ", name, pass);
        var token = Security.salt();
        var hashpass = Security.crypt(pass, token);
        var data = await db.one('SELECT COALESCE(MAX(ID)+1,1) as NewId FROM Users');
        try {
            await db.none("INSERT INTO Users(id,username,pass,salt) VALUES($1,$2,$3,$4)", [data.newid, name, hashpass, token]);
            // res.status(200).json({
            // 	message: "Successfully registred!"
            // })
            return true;
        } catch (e) {
            // res.status(500).json({
            // 	message: "Sorry something went wrong."
            // })
            console.log("this is errrorr ", e);
            return false;
        }
    }
    static async exists(name) {
        console.log("exist ?", name);
        var count = await db.one('SELECT COUNT(1) as Counter FROM Users WHERE Users.username = $1', name);
        console.log("count ", count)
        if (Number(count.counter) !== 0) {
            return true;
        }
        return false;
    }

    static async auth(name, pass) {
        console.log('auth ', name, pass);
        var auth = await db.one('SELECT Salt,pass FROM USERS WHERE username = $1', name);
        var hashpass = Security.crypt(pass, auth.salt);
        console.log("this is i am looking for ", auth.pass, hashpass);
        if (auth.pass.trim() === hashpass) {
            return true;
        }
        return false;
    }

    static async getId(user) {
        return (await db.one("SELECT id FROM Users WHERE username = $1", user)).id;
    }
}

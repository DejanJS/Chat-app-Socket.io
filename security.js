const crypto = require("crypto");
module.exports = class Security{
     static crypt(pass,salt,iteration = 100000,keylen = 64,alg="sha256"){
        return crypto.pbkdf2Sync(pass,Buffer.from(salt),iteration,keylen,alg).toString('hex');
    }
    static salt() {
        let number = crypto.randomBytes(16);
        let token = number.toString('hex');
        return token;
    }
}
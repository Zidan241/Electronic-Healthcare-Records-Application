const crypto = require('crypto');

// encrypt data using RSA
function encrypt(data, publicKey) {
    const buffer = Buffer.from(data);
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
}

//generate key pair
function generateKeyPair() {
    const key = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    return key;  
}

//decrypt data using RSA
function decrypt(data, privateKey) {
    const buffer = Buffer.from(data, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString();
}

//generate sha256 hash
function generateHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

//generate signature
function generateSignature(data, privateKey) {
    const buffer = Buffer.from(data);
    const signature = crypto.sign('RSA-SHA256', buffer , privateKey);
    return signature;
}

//verify signature
function verifySignature(data, signature, publicKey) {
    const buffer = Buffer.from(data);
    const isVerified = crypto.verify('RSA-SHA256', buffer, publicKey, signature);
    return isVerified;
}
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.generateKeyPair = generateKeyPair;
exports.generateSignature = generateSignature;
exports.verifySignature = verifySignature;
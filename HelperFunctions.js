const crypto = require('crypto');

//generate hash
function generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

//symmetric encryption
function encryptSymmetric(data, key, iv) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

//symmetric decryption
function decryptSymmetric(data, key, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

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

exports.generateHash = generateHash;
exports.encryptSymmetric = encryptSymmetric;
exports.decryptSymmetric = decryptSymmetric;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.generateKeyPair = generateKeyPair;
exports.generateSignature = generateSignature;
exports.verifySignature = verifySignature;
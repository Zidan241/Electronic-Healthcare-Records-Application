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
    const hash = generateHash(data);
    const signature = crypto.createSign('RSA-SHA256');
    signature.update(hash);
    return signature.sign(privateKey, 'hex');
}

//verify signature
function verifySignature(data, signature, publicKey) {
    const buffer = Buffer.from(data);
    const verified = crypto.publicDecrypt(publicKey, Buffer.from(signature, 'base64'));
    return verified.toString('utf8') === data;
}
const keys = generateKeyPair();
const encryptedData = encrypt('Hello World', keys.publicKey);
console.log(encryptedData);
const {CentralAuthority} = require('./CentralAuth.js');
const {encrypt, generateSignature, generateKeyPair} = require('./HelperFunctions.js');
const {addKey} = require('./PublicKeysStorage.js');

class Client{
    constructor(centralAuthority, id, name){
        const {publicKey,privateKey} = generateKeyPair();
        addKey(publicKey, id);
        this.id = id;
        this.name = name;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.centralAuthority = centralAuthority;
        console.log("Client created");
    }
    addPatient(patientData){
        const centralAuthorityPublicKey = this.centralAuthority.publicKey;
        const encryptedData = encrypt(patientData, centralAuthorityPublicKey);
        const signature = generateSignature(encryptedData, this.privateKey);
        this.centralAuthority.addNewTransaction(encryptedData, signature, this.id);
    }
    addEvent(eventData){
        const signature = generateSignature(eventData, this.privateKey);
        this.centralAuthority.addNewTransaction(eventData, signature, this.id);
    }
}

exports.Client = Client;
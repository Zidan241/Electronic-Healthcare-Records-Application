const {generateSignature, verifySignature, generateKeyPair, decrypt, generateHash} = require('./HelperFunctions.js');
const {addKey,getKey} = require('./PublicKeysStorage.js');
const {Block} = require('./Blockchain.js');

class CentralAuthority{
    constructor(blockchain, id){
        const {publicKey,privateKey} = generateKeyPair();
        addKey(publicKey, id);
        this.id = id;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.blockchain = blockchain;
        this.transactionsBuffer = [];
        console.log("Central Authority created");
    }
    addNewTransaction(transactionData, signature, senderId){
        //get sender public key
        const senderPublicKey = getKey(senderId);
        //verify signature
        if(verifySignature(transactionData, signature, senderPublicKey)){
            //decrypt data using central authority private key
            const decryptedData = decrypt(transactionData, this.privateKey);
            //add transaction to buffer
            this.transactionsBuffer.push(decryptedData);
            this.addNewBlockCheck();
            console.log("Transaction added");
            //verification successful
            return true;
        }
        //verification failed
        console.log("Verification failed");
        return false;
    }
    addNewBlockCheck(){
        //if there are more than 10 transactions in the buffer, create a new block
        if(this.transactionsBuffer.length >= 1){
            const newBlock = new Block(this.blockchain.getLatestBlock().index + 1, new Date(), this.transactionsBuffer, this.blockchain.getLatestBlock().hash);
            const newBlockHash = generateHash(JSON.stringify(newBlock));
            const signature = generateSignature(newBlockHash, this.privateKey);
            this.blockchain.addNewBlock(newBlock,signature, this.id);
            this.transactionsBuffer = [];
        }
    }
}

exports.CentralAuthority = CentralAuthority;
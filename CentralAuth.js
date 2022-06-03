const {verifySignature, generateKeyPair} = require('./HelperFunctions.js');
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
            //add transaction to buffer
            this.transactionsBuffer.push(transactionData);
            this.addNewBlockCheck();
            //return true
            return true;
        }
        this.transactionsBuffer.push(newBlock);
    }
    addNewBlockCheck(){
        //if there are more than 10 transactions in the buffer, create a new block
        if(this.transactionsBuffer.length >= 1){
            const newBlock = new Block(this.blockchain.getLatestBlock().index + 1, new Date(), this.transactionsBuffer, this.blockchain.getLatestBlock().hash);
            this.blockchain.addNewBlock(newBlock);
            this.transactionsBuffer = [];
            console.log(newBlock);
        }
    }
}

exports.CentralAuthority = CentralAuthority;
const {verifySignature} = require('./HelperFunctions.js');
const publicKeys = require('./PublicKeys.json');
const {Block} = require('./Blockchain.js');

class CentralAuthority{
    constructor(blockchain){
        this.blockchain = blockchain;
        this.transactionsBuffer = [];
    }
    addNewTransaction(transactionData, signature, senderId){
        //get sender public key
        const senderPublicKey = publicKeys[senderId];
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
        if(this.transactionsBuffer.length >= 10){
            const newBlock = new Block(this.blockchain.getTheLatestBlock().index + 1, new Date(), this.transactionsBuffer, this.blockchain.getTheLatestBlock().hash);
            this.blockchain.addNewBlock(newBlock);
            this.transactionsBuffer = [];
        }
    }
}

exports.CentralAuthority = CentralAuthority;
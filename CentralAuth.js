import {verifySignature} from './HelperFunctions.js';

class CentralAuthority{
    constructor(blockchain){
        this.blockchain = blockchain;
        this.transactionsBuffer = [];
    }
    addNewTransaction(transactionData, signature){
        this.transactionsBuffer.push(newBlock);
    }
}
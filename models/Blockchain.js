const Block = require('./Block.js');
const Transaction = require('./Transaction.js');
const actions = require('../utils/constants');

class Blockchain {
  /**
   * @param {number} difficulty
   * @param {number} bufferLimit
   */
  constructor(difficulty, bufferLimit, io) {
    this.blockchain = [this.createGenesisBlock()];
    // list of transactions that are yet to mined to a block
    this.transactionBuffer = [];
    this.difficulty = difficulty;
    this.bufferLimit = bufferLimit;
    this.nodes = [];
    this.io = io;
    console.log("Blockchain created");
  }
  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block(0, Date.parse("2017-01-01"), [], "0", 0);
  };

  /**
   * @returns {Block}
   */
  getLatestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  };

  /**
   * @param {number} node
   */
  addNode(node) {
    this.nodes.push(node);
  };

  /**
   * @param {Transaction} transaction
   */
  addTransaction(transaction) {
    if (transaction.isValid()) {
      //TODO: check if this docotor is allowed to add a transaction for this patient

      //get the patients last transaction
      const lastTransactionIndex = this.getIndexOfLastTransaction(transaction.patientId);
      const lastTransaction = null;
      if(lastTransactionIndex != null){
        lastTransaction = this.blockchain[lastTransactionIndex[0]].transactions[lastTransactionIndex[1]];
      }
      transaction.previousTransaction = lastTransaction;

      //loop over all transactions and check that the doctor id is in one of the transactions in the 'to' field
      var flag = false;
      const patientTransactions = this.getTransactions(transaction.patientId);
      for(let i=0 ; i<patientTransactions.length ; i++){
        if(patientTransactions[i].doctorId == transaction.doctorId || patientTransactions[i].refferalId == transaction.refferalId){
          flag = true;
          break;
        }
      }
      if(patientTransactions.length == 0){
        flag = true;
      }
      if(!flag){
        console.error("Doctor is not allowed to add a transaction for this patient");
      }
      
      //add transaction to buffer
      this.transactionBuffer.push(transaction);
      console.log("Transaction added");
      //check if buffer is full
      if (this.transactionBuffer.length >= this.bufferLimit) {
        console.info("Starting mining block...");
        process.env.BREAK = false;
        this.mineBlock();
        this.transactionBuffer = [];
      }
    } else {
      //verification failed
      console.error("Transaction verification failed");
      console.error(transaction);
    }
  };

  async mineBlock() {
    const newBlock = new Block(
      this.getLatestBlock().index + 1,
      new Date(),
      this.transactionBuffer,
      this.getLatestBlock().hash,
      0
    );
    const breakFlag = await newBlock.mineBlock(this.difficulty);
    if (breakFlag != "true") {
      this.blockchain.push(newBlock);
      console.log("Block successfully mined!");
      this.io.emit(actions.END_MINING, this.blockchain);
    }
  };

  /**
   * @param {string} patientId
   * @returns {Transaction[]} all encrypted transactions for a patient and their index in the blockchain
   */
  getTransactions(patientId) {
    let transactions = [];
    var transactionIndex = this.getIndexOfLastTransaction(patientId);
    if(transactionIndex != null){
      var transaction = this.blockchain[transactionIndex[0]].transactions[transactionIndex[1]];
      while (transaction != null) {
        transactions.push(transaction);
        transactionIndex = transaction.previousTransaction;
        transaction = this.blockchain[transactionIndex[0]].transactions[transactionIndex[1]];
      }
    }
    return transactions;
  };

  /**
   * @param {string} patientId
   * @returns {number[]} all encrypted transactions for a patient and their index in the blockchain
   */
  getIndexOfLastTransaction(patientId){
    for (let i = this.blockchain.length - 1 ; i >= 0 ; i--) {
      for (let j = 0 ; j < this.blockchain[i].transactions.length ; j++) {
        if (this.blockchain[i].transactions[j].patientId === patientId) {
          return [i,j];
          break;
        }
      }
    }
    return null;
  };

  /**
   * @returns {boolean}
   */
  validateChainIntegrity() {
    // Check if the Genesis block is valid
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.blockchain[0])) {
      return false;
    }
    for (let i = 1; i < this.blockchain.length; i++) {
      const currentBlock = this.blockchain[i];
      const previousBlock = this.blockchain[i - 1];
      if (currentBlock.hash !== currentBlock.generateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
    }
    return true;
  };

  parseBlockchain(blocks) {
    this.blockchain = blocks.map(block => {
      const newBlock = new Block(block.index, block.timestamp, block.transactions, block.previousHash, block.nonce);
      return newBlock;
    });
  };
};

module.exports = Blockchain;
const Block = require('./Block.js');
const Transaction = require('./Transaction.js');
const actions = require('../utils/constants');
const { generateHash } = require('../utils/helperFunctions.js');

class Blockchain {
  /**
   * @param {number} difficulty
   * @param {number} bufferLimit
   */
  constructor(difficulty, bufferLimit, io, getBreakFlag, updateBreakFlag) {
    this.blockchain = [this.createGenesisBlock()];
    // list of transactions that are yet to mined to a block
    this.transactionBuffer = [];
    this.difficulty = difficulty;
    this.bufferLimit = bufferLimit;
    this.nodes = [];
    this.io = io;
    this.getBreakFlag = getBreakFlag;
    this.updateBreakFlag = updateBreakFlag;
  }
  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block(0, Date.now("2017-01-01"), [], "0", null, 0);
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
      var lastTransactionIndex = this.getIndexOfLastTransaction(transaction.patientId);
      var lastTransaction = null;
      var allowedDoctors = [];
      if(lastTransactionIndex != null){
        lastTransaction = this.blockchain[lastTransactionIndex[0]].transactions[lastTransactionIndex[1]];
        allowedDoctors = lastTransaction.allowedDoctors;
        if(lastTransaction.referralId){
          allowedDoctors.push(lastTransaction.referralId);
        }
      }else{
        //if there is no transaction for this patient, then he/she is allowed to add the first transaction
        allowedDoctors.push(transaction.doctorId);
      }
      transaction.updateTransaction(lastTransactionIndex, allowedDoctors);

      //check if doctor is allowed to add a transaction for this patient
      if(!allowedDoctors.includes(transaction.doctorId)){
        console.error(`${transaction.doctorId} is not allowed to add a transaction for patient ${transaction.patientId}`);
      }
      
      //add transaction to buffer
      this.transactionBuffer.push(transaction);
      console.info("Transaction added");
      //check if buffer is full
      if (this.transactionBuffer.length >= this.bufferLimit) {
        console.info("Starting mining block...");
        this.updateBreakFlag(false);
        this.mineBlock();
        this.transactionBuffer = [];
      }
    } else {
      //verification failed
      console.error("Transaction verification failed");
    }
  };

  async mineBlock() {
    const newBlock = new Block(
      this.getLatestBlock().index + 1,
      Date.now(),
      this.transactionBuffer,
      this.getLatestBlock().hash,
      null,
      0
    );
    const breakFlag = await generateProofOfWork(newBlock, this.difficulty, this.getBreakFlag);
    if (breakFlag == false){
      this.blockchain.push(newBlock);
      console.info("Block successfully mined!");
      this.io.emit(actions.END_MINING, this.blockchain);
    } else {
      console.info("Block not mined!");
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
    //check the buffer
    for (let i = this.blockchain.length - 1 ; i >= 0 ; i--) {
      for (let j = 0 ; j < this.blockchain[i].transactions.length ; j++) {
        if (this.blockchain[i].transactions[j].patientId === patientId) {
          return [i,j];
        }
      }
    }
    return null;
  };

  /**
   * @returns {boolean}
   */
  validateChainIntegrity() {
    for (let i = 1; i < this.blockchain.length; i++) {
      const currentBlock = this.blockchain[i];
      const previousBlock = this.blockchain[i - 1];
      if (currentBlock.hash != currentBlock.generateHash()) {
        console.error("Block #" + i + " hash is invalid");
        return false;
      }
      if (currentBlock.previousHash != previousBlock.hash) {
        console.error("Block #" + i + " previous hash is invalid");
        return false;
      }
      if (!currentBlock.hasValidTransactions()) {
        console.error("Block #" + i + " has invalid transactions");
        return false;
      }
    }
    return true;
  };

  parseBlockchain(blocks) {
    this.blockchain = blocks.map(block => {
      const newBlock = new Block(0);
      newBlock.parseBlock(block);
      return newBlock;
    });
  };
};

const generateProofOfWork = (block, difficulty, getBreakFlag) => new Promise((resolve) => {
  setImmediate(async () => {
    const END_MINING = getBreakFlag();
    if (block.hash.substring(0, difficulty) == "0".repeat(difficulty) || END_MINING == true) {
      resolve(END_MINING);
    } else  {
      block.nonce = Math.random();
      block.hash = block.generateHash();
      resolve(await generateProofOfWork(block, difficulty, getBreakFlag));
    }
  });
});

module.exports = Blockchain;
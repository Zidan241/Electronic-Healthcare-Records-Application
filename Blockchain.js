const SHA256 = require("crypto-js/sha256");
class Block{
  constructor(index, timestamp, data, previousHash){
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.generateHash();
    console.log("Block created");
  }

  generateHash(){
    return SHA256(this.index + this.timestamp + this.previousHash + JSON.stringify(this.data)).toString()
  }
}
class Blockchain{
  constructor(){
      this.blockchain = [this.createGenesisBlock()];
      console.log("Blockchain created");
  }
  createGenesisBlock(){
      return new Block(0, new Date(), "first block on the chain", "0");
  }
  getLatestBlock(){
      return this.blockchain[this.blockchain.length - 1];
  }
  addNewBlock(newBlock){
      newBlock.previousHash = this.getLatestBlock().hash;
      newBlock.hash = newBlock.generateHash();
      this.blockchain.push(newBlock);
  }

  // testing the integrity of the chain
  validateChainIntegrity(){
      for(let i = 1; i<this.blockchain.length; i++){
          const currentBlock = this.blockchain[i];
          const previousBlock = this.blockchain[i-1];
          if(currentBlock.hash !== currentBlock.generateHash()){
              return false;
          }
          if(currentBlock.previousHash !== previousBlock.hash){
              return false;
          }
          return true;

      }
  }
}

exports.Block = Block;
exports.Blockchain = Blockchain;
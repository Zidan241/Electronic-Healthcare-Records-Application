const SHA256 = require("crypto-js/sha256");
const {getKey} = require('./PublicKeysStorage.js');
const {decrypt, verifySignature} = require('./HelperFunctions.js');

class Block{
  constructor(index, timestamp, data, previousHash){
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.generateHash();
    this.patients = [];
    this.nonce = 0;
    console.log("Block created");
  }

  generateHash(){
    return SHA256(this.index + this.timestamp + this.previousHash + JSON.stringify(this.data) + this.nonce).toString()
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
  addNewBlock(newBlock, signature, id){
      const centralAuthorityPublicKey = getKey(id);
      if(verifySignature(JSON.stringify(newBlock),signature, centralAuthorityPublicKey)){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock = mineBlock(4,newBlock);
        this.blockchain.push(newBlock);
        console.log("Block added");
        return true;
      }
      console.log("Verification failed");
      return false;
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
      }
      console.log("Chain integrity verified");
      return true;
  }
}
function checkDifficulty(difficulty, hash) {
  return hash.substr(0, difficulty) === "0".repeat(difficulty)
}
function updateHash(block) {
  return { ...block, hash: block.generateHash()}
}
function nextNonce(block) {
  return updateHash({ ...block, nonce: block.nonce + 1 })
}
function trampoline(func) {
  let result = func.apply(func, ...arguments);
  while(result && typeof(result) === "function") {
    result = result();
  }
  return result;
}
function mineBlock(difficulty, block) {
  function mine(block) {
    const newBlock = nextNonce(block);
    return checkDifficulty(difficulty, newBlock.hash)
            ? newBlock
            : () => mine(nextNonce(block));
  }
  return trampoline(mine(nextNonce(block)));
}
exports.Block = Block;
exports.Blockchain = Blockchain;
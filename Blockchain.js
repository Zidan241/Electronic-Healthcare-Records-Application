class Block {
    constructor(id, data, prevHash = ''){
      this.id = id;
      this.prevHash = this.prevHash;
      this.hash = this.calcHash();
      this.data = data;
    }
    calcHash() {
      return CryptoJS.SHA512(this.id + JSON.stringify(this.data)).toString();
    }
  
  }
  class Chain {
    constructor(){
      this.chain = [this.genesisBlock()];
    }
    genesisBlock(){
      return new Block(0,'Chain started.');
    }
    getLastBlock(){
      return this.chain[this.chain.length - 1];
    }
    addBlock(block){
      block.prevHash = this.getLastBlock().hash;
      block.hash = block.calcHash();
      this.chain.push(block)
    }
    isValid(){
      for(let i = 1; i < this.chain.length; i++){
        let prev = this.chain[i-1], current = this.chain[i];
        if(current.hash !== prev.prevHash || current.hash !== current.calcHash())
         return false;
      }return true;
    }
  
  }
  
  // Msg.js
  class Msg {
    constructor(msg, date){
      this.msg = msg;
      const D = new Date();
      this.date = [D.getHours(), D.getMinutes(), D.getSeconds()].join(' : ');
    }
  }
  
  // Test.js
  FROZENCHAINS = [];
  CHAIN = new Chain();
  i = 0;
  
  msg = () => {
    let text = $('input').val();
    i++;
   CHAIN.addBlock(new Block(i, text));
  
   let msg = JSON.stringify(CHAIN.chain,null, 4);
  
   $('#log').text(msg);
   let thisMSG = new Msg(text);
  
   $('section').append('<div class="notification is-primary"><span class="tag">' + thisMSG.msg + '</span>'
   + '<span class="tag">Created at: ' + thisMSG.date + '</span><button onclick="$(this).parent().hide() && newChain()" align=center class="delete is-large"></button></div>')
  
  
  }
  
  newChain = () => {
    FROZENCHAINS.push(CHAIN);
    delete CHAIN;
    CHAIN = new Chain();
    CHAIN.addBlock(1,'Hi')
  }
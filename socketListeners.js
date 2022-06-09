const actions = require('./utils/constants');

const socketListeners = (socket, chain) => {
  socket.on(actions.ADD_TRANSACTION, (tx) => {
    chain.newTransaction(tx);
    console.info(`Added transaction: ${tx}`);
  });

  socket.on(actions.END_MINING, (newChain) => {
    console.log('End Mining encountered');
    process.env.BREAK = true;
    const blockChain = new Blockchain();
    blockChain.parseChain(newChain);
    if (blockChain.checkValidity() && blockChain.getLength() >= chain.getLength()) {
      chain.blocks = blockChain.blocks;
    }
  });

  return socket;
};

module.exports = socketListeners;
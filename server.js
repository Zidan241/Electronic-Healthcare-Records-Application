const app = require('express')();
const bodyParser = require('body-parser');
const httpServer = require('http').Server(app);
const axios = require('axios');
const io = require('socket.io')(httpServer);
const client = require('socket.io-client');
const BlockChain = require('./models/Blockchain');
const Transaction = require('./models/Transaction');
const actions  = require('./utils/constants');
const socketListeners = require('./socketListeners');
var portfinder = require('portfinder');
const {generateKeyPair, generateSymmetricKey} = require('./utils/helperFunctions');
const {addKey, getLength} = require('./db/publicKeysStorage');
const { v4: uuidv4 } = require('uuid');

portfinder.getPort(function (err, PORT) {
    const blockChain = new BlockChain(4, 2, io);
    const patients = {};
    const doctorId = `doc-${getLength()}`;
    const {publicKey, privateKey} = generateKeyPair();
    addKey(publicKey, doctorId);
    

    app.use(bodyParser.json());

    app.post('/nodes', (req, res) => {
    const { host, port } = req.body;
    const { callback } = req.query;
    const node = `http://${host}:${port}`;
    const socketNode = socketListeners(client(node), blockChain);
    blockChain.addNode(socketNode, blockChain);
    if (callback === 'true') {
        console.info(`Added node ${node} back`);
        res.json({ status: 'Added node Back' }).end();
    } else {
        axios.post(`${node}/nodes?callback=true`, {
            host: req.hostname,
            port: PORT,
        });
        console.info(`Added node ${node}`);
        res.json({ status: 'Added node' }).end();
    }
    });

    app.post('/addPatient', (req, res) => {
        const {name, age, weight, height, gender, bloodPressure, pulse, temperature} = req.body;
        if(!name||!age||!weight||!height||!gender||!bloodPressure||!pulse||!temperature){
            return res.status(400).json({error:"missing requirements"});
        }
        const patientId = uuidv4();
        const pateintKey = generateSymmetricKey();
        patients[patientId] = pateintKey;
        const tx = new Transaction(doctorId, patientId, req.body);
        tx.signTransaction(privateKey);
        tx.encryptData(pateintKey);
        io.emit(actions.ADD_TRANSACTION, tx);
        res.json({ message: 'transaction success' }).end();
    });

    app.post('/newVisit', (req, res) => {
        const { sender, receiver, amount } = req.body;
        io.emit(actions.ADD_TRANSACTION, sender, receiver, amount);
        res.json({ message: 'transaction success' }).end();
    });

    app.get('/chain', (req, res) => {
        res.json(blockChain.toArray()).end();
    });

    io.on('connection', (socket) => {
        console.info(`Socket connected, ID: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`Socket disconnected, ID: ${socket.id}`);
        });
    });

    blockChain.addNode(socketListeners(client(`http://localhost:${PORT}`), blockChain));

    httpServer.listen(PORT, () =>{
        console.info(`Server started on port ${PORT}`);
    });
});
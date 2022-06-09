const fs = require('fs');
function addKey(key, id){
    let rawdata = fs.readFileSync('./db/publicKeys.json');
    let publicKeys = JSON.parse(rawdata);
    publicKeys[id] = key;
    fs.writeFileSync('./db/publicKeys.json', JSON.stringify(publicKeys));
    console.log("Added public key for " + id);
}
function getKey(id){
    let rawdata = fs.readFileSync('./db/publicKeys.json');
    let publicKeys = JSON.parse(rawdata);
    return publicKeys[id];
}
function getLength(){
    let rawdata = fs.readFileSync('./db/publicKeys.json');
    let publicKeys = JSON.parse(rawdata);
    return Object.keys(publicKeys).length;
}

exports.getLength = getLength;
exports.addKey = addKey;
exports.getKey = getKey;
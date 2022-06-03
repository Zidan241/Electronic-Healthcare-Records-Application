publicKeys = {};
function addKey(key, id){
    publicKeys[id] = key;
    console.log("Added public key for " + id);
}
function getKey(id){
    return publicKeys[id];
}

exports.addKey = addKey;
exports.getKey = getKey;
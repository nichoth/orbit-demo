// const Ipfs = require('ipfs')
// const OrbitDB = require('orbit-db')
// var Npp = require('./new-piece-please')

var npp = require('./new-piece-please')

// var npp = new Npp(Ipfs, OrbitDB)

npp.onready = async () => {
    console.log('**id**', npp.orbitdb.id)
    console.log('**pieces**', npp.pieces.id)

    const cid = npp.addNewPiece('QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ')
    const content = await npp.node.dag.get(cid)
    console.log('node.dag.get', content.value.payload)
}

console.log('hello')

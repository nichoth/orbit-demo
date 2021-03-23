const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

async function main () {
    const initIPFSInstance = async () => {
        return await IPFS.create({ repo: "./path-for-js-ipfs-repo" })
    }

    initIPFSInstance().then(async ipfs => {
        const orbitdb = await OrbitDB.createInstance(ipfs)
    
        // Create / Open a database
        const db = await orbitdb.log("hello")
        await db.load()
    
        // Listen for updates from peers
        db.events.on("replicated", address => {
            console.log('*replicaated*', address,
                db.iterator({ limit: -1 }).collect())
        })
    
        // Add an entry
        const hash = await db.add("world")
        console.log('*hash*', hash)
    
        // Query
        const result = db.iterator({ limit: -1 }).collect()
        console.log('*query*', JSON.stringify(result, null, 4))
    })
}

main()



// -------------------------------------------------------------------


// https://github.com/orbitdb/field-manual/blob/master/01_Tutorial/01_Basics.md

// // const Ipfs = require('ipfs')
// // const OrbitDB = require('orbit-db')
// // var Npp = require('./new-piece-please')

// var npp = require('./new-piece-please')

// // var npp = new Npp(Ipfs, OrbitDB)

// npp.onready = async () => {
//     // console.log('**id**', npp.orbitdb.id)
//     console.log('**pieces**', npp.pieces.id)

//     const cid = npp.addNewPiece('QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ')
//     const content = await npp.node.dag.get(cid)
//     console.log('node.dag.get', content.value.payload)

//     console.log('fooooo')
// }

// console.log('hello')

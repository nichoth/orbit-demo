const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const Identities = require('orbit-db-identity-provider')

async function main () {
    // Create IPFS instance
    const ipfsOptions = { repo : './ipfs' }
    const ipfs = await IPFS.create(ipfsOptions)

    var id = await Identities.createIdentity({ id: 'local-id' })
    console.log('**id**', id.toJSON())

    // Create OrbitDB instance
    const orbitdb = await OrbitDB.createInstance(ipfs, {
        identity: id
    })

    // Create database instance
    const db = await orbitdb.keyvalue('first-database')
    const address = db.address
    console.log('**address**', address.toString())
    const identity = db.identity
    console.log('**identity**', identity.toJSON())

}

main()


const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

async function main () {
  // Create IPFS instance
  const ipfsOptions = { repo : './ipfs', }
  const ipfs = await IPFS.create(ipfsOptions)

  // Create OrbitDB instance
  const orbitdb = await OrbitDB.createInstance(ipfs)
}

main()


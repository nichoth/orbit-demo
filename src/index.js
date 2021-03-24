const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
var timestamp = require('monotonic-timestamp')

// https://github.com/orbitdb/orbit-db#module-with-ipfs-instance
async function main () {
    const initIPFSInstance = async () => {
        return await IPFS.create({
            pubsub: true,
            EXPERIMENTAL: { pubsub: true },
            repo: "./path-for-js-ipfs-repo"
        })
    }

    initIPFSInstance().then(async ipfs => {
        const orbitdb = await OrbitDB.createInstance(ipfs)

        // Create / Open a database
        var db = await orbitdb.log('test')
        await db.load()
    
        // Listen for updates from peers
        db.events.on("replicated", address => {
            console.log('*replicated*')
            console.log('*replicated*', address,
                db.iterator({ limit: -1 }).collect())
        })
    
        // Add an entry
        const hash = await db.add({
            _id: 'QmAwesomeIpfsHash',
            name: 'foo',
            followers: 500
        })
        // const hash = await db.add("world")
        console.log('*hash*', hash)
    
        // Query
        // const result = db.query(doc => (doc))
        // const result = db.iterator({ limit: -1 }).collect()
        // console.log('*query*', JSON.stringify(result, null, 4))

        replication(db)
    })

    async function replication (db) {
        // Create the second peer
        console.log('in replication****')
        const ipfs2_config = { repo: './ipfs2', }
        const ipfs2 = await IPFS.create(ipfs2_config)

        // Open the first database for the second peer,
        // ie. replicate the database
        const orbitdb2 = await OrbitDB.createInstance(ipfs2, {
            directory: './orbitdb2'
        })
        console.log('**addr**', db.address.toString())
        // tried changin this to `open`
        const db2 = await orbitdb2.open(db.address.toString())
        await db2.load()

        console.log('Making db2 check replica')

        db.events.on('replicated', (ev) => {
            console.log('aaaaaaaa', ev)
        })


        // When the second database replicated new heads, query the database
        db2.events.on('replicated', () => {
            console.log('**replicated**')
            const result = db2.iterator({ limit: -1 })
                .collect().map(ev => ev.payload.value)

            console.log('**result**', result.join('\n'))
        })

        // Start adding entries to the first database
        setInterval(async () => {
            console.log('**interval**')
            await db.add({ _id: timestamp(), time: timestamp() })
        }, 2000)
    }

}

main()

console.log('hello')

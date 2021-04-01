const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
var timestamp = require('monotonic-timestamp')



// -----------------------------------------------

const defaultFilter = () => true

const connectIpfsNodes = async (ipfs1, ipfs2, options = {
  filter: defaultFilter
}) => {
    const id1 = await ipfs1.id()
    const id2 = await ipfs2.id()

    console.log('**ids**', id1, id2)

    const addresses1 = id1.addresses.filter(options.filter)
    const addresses2 = id2.addresses.filter(options.filter)

    console.log('in here addr***', addresses1, addresses2)

    await ipfs1.swarm.connect(addresses2[0])
    await ipfs2.swarm.connect(addresses1[0])
}


// -----------------------------------------------




// https://github.com/orbitdb/orbit-db#module-with-ipfs-instance
async function main () {
    const initIPFSInstance = async () => {
        return await IPFS.create({
            pubsub: true,
            EXPERIMENTAL: { pubsub: true },
            config: {
                Addresses: {
                    API: '/ip4/127.0.0.1/tcp/0',
                    Swarm: [
                        // '/ip4/127.0.0.1/tcp/0',
                        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
                        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
                        '/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/',
                    ],
                    Gateway: '/ip4/0.0.0.0/tcp/0'
                },
            },
            repo: "./path-for-js-ipfs-repo"
        })
    }

    initIPFSInstance().then(async ipfs => {
        const orbitdb = await OrbitDB.createInstance(ipfs)

        ipfs.libp2p.on('peer:connect', (peer) => {
            console.info('Producer Found:', peer.id)
        })

        // Create / Open a database
        var db = await orbitdb.log('test')
        await db.load()
    
        // Listen for updates from peers
        db.events.on("replicated", address => {
            console.log('*replicated*', address)
            console.log(db.iterator({ limit: -1 }).collect())
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

        replication(db, ipfs)
    })

    async function replication (db, ipfs) {
        // Create the second peer
        console.log('in replication****')
        const ipfs2_config = {
            repo: './ipfs2',
            pubsub: true,
            config: {
                Addresses: {
                    API: '/ip4/127.0.0.1/tcp/0',
                    Swarm: [
                        // '/ip4/127.0.0.1/tcp/0',
                        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
                        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
                        '/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/'
                    ],
                    Gateway: '/ip4/0.0.0.0/tcp/0'
                },
            },
            EXPERIMENTAL: { pubsub: true },
            Bootstrap: [db.address.toString()]
        }
        const ipfs2 = await IPFS.create(ipfs2_config)

        connectIpfsNodes(ipfs, ipfs2)

        // Open the first database for the second peer,
        // ie. replicate the database
        const orbitdb2 = await OrbitDB.createInstance(ipfs2, {
            directory: './orbitdb2'
        })
        const db2 = await orbitdb2.log(db.address.toString());
        // const db2 = await orbitdb2.open(db.address.toString())

        console.log('**addr**', db.address.toString())
        // tried changing this to `open`
        // const db2 = await orbitdb2.open(db.address.toString())
        await db2.load()




        // var protocol = '/p2p-circuit/ipfs'
        // var multiaddr = db.address.toString()
        // console.log('swarm.connect: ', protocol + multiaddr) 
        // console.log('multiaddr', multiaddr) 

        // await ipfs2.swarm.connect(multiaddr, {
        //     recursive: false
        // })





        ipfs2.libp2p.on('peer:connect', (peer) => {
            console.info('Producer Found:', peer.id)
        })



        console.log('Making db2 check replica')

        db.events.on('replicated', (ev) => {
            console.log('original db replicated', ev)
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
            // await db2.add({ _id: timestamp(), time: timestamp() })
        }, 2000)
    }

}

main()

console.log('hello')

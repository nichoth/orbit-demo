// var Ipfs = require('ipfs')
// var OrbitDB = require('orbit-db')

class NewPiecePlease {
    constructor (Ipfs, OrbitDB) {
        this.Ipfs = Ipfs
        this.OrbitDB = OrbitDB

        this.node = new Ipfs({
            preload: { enabled: false },
            repo: './ipfs',
            EXPERIMENTAL: { pubsub: true },
            config: {
                Bootstrap: [],
                Addresses: { Swarm: [] }
            }
        })
      
        this.node.on('error', (err) => { throw (err) })
        this.node.on('ready', this._init.bind(this))
    }

    async _init () {
        this.orbitdb = await this.OrbitDB.createInstance(this.node)
        this.defaultOptions = {
            accessController: { write: [this.orbitdb.identity.id] }
        }
        const docStoreOptions = {
            ...this.defaultOptions,
            indexBy: 'hash'
        }
        this.pieces = await this.orbitdb.docstore('pieces', docStoreOptions)
        await this.pieces.load()
        this.onready()
    }

    async addNewPiece (hash, instrument = 'Piano') {
        // const existingPiece = this.getPieceByHash(hash)
        // if (existingPiece) {
        //     // await this.updatePieceByHash(hash, instrument)
        //     return
        // }
    
        const cid = await this.pieces.put({ hash, instrument })
        console.log('**cid', cid)
        return cid
    }
}

// module.exports = NewPiecePlease

// window.npp = module.exports = new NewPiecePlease(Ipfs, OrbitDB)
window.npp = module.exports = new NewPiecePlease(window.Ipfs, window.OrbitDB)

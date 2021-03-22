npp = require('./new-piece-please')

npp.onready = () => {
    console.log('**id**', npp.orbitdb.id)
    console.log('pieces', npp.pieces.id)
}

console.log('hello')

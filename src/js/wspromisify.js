import { v4 as uuidv4 } from 'uuid'
import { msgpack } from './msgpack.js'

let default_config = {
    host: 'ws://localhost:8170/ws',
    protocols: [],
    lazy: false,
    on_open_websocket: null,
    on_message_websocket: null,
    on_close_websocket: null,
    on_error_websocket: null,
    recconnect_max:3,
    adapter: (host, protocols) => new WebSocket(host, protocols),
    server: { id: 'id', msg: '_msg' },
    encode: (message_id, message_data, server) => msgpack.encode({ [server.id]: message_id, [server.msg]: message_data }),
    decode: (msg) => msgpack.decode(msg),
    server: {
        id: 'id',
        msg: '_msg'
    }
}

function WebSocketClient(default_config, user_config = {}) {
    this.config = Object.assign({}, default_config, user_config)
    this.ws = null
    this.onConnecting = null
    this.queue = {}
    this.recconnect_max = this.config.recconnect_max
    this.open = function(){if (this.ws !== null && !this.config.lazy) {this.connect(); (async () => await this.ready())();}}
    this.close = function(){if (this.ws !== null) this.ws.close()}
    this.ready = async function () {
        return new Promise((resolve) => {
            if (this.ws.readyState === WebSocket.OPEN) resolve();
            else this.onConnecting = resolve
        })
    }
    this.connect = function () {
        this.ws = this.config.adapter(this.config.host, this.config.protocols)
        this.ws.onopen = (event) => { if (this.onConnecting) this.onConnecting(); console.log('WebSocket opened') }
        this.ws.onclose = (event) => { console.log('WebSocket closed'); if (this.config.on_close_websocket !==null && this.recconnect_max > 0) {this.recconnect_max--;;this.config.on_close_websocket();} }
        this.ws.onerror = (event) => { console.log('WebSocket error') }
        this.ws.onmessage = (event) => {
            this.config.decode(event.data).then((data)=>{let m = this.queue[data[this.config.server.id]](data[this.config.server.msg]); delete this.queue[data[this.config.server.id]]; return m;} )
        }
    }
    this.send = async function (msg) {
        return new Promise((resolve, reject) => {
            let id = uuidv4()
            this.ws.send(this.config.encode(id, msg, this.config.server))    
            this.queue[id] = resolve
        })
    }
    if (!this.config.lazy) {this.connect(); (async () => await this.ready())();}
}

export { WebSocketClient, default_config };
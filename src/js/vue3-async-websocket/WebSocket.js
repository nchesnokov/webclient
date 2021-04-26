/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-unreachable */
import { createID } from './Mixins';
import Listeners from './Listeners';
import Send from './Send';


const defOptions = {
    'debug': false,
    
    'protocols': '',
    'load-on-start': false,
    
    'max-timeout': 5000,

    'reconnect': true,
    'max-reconnect-count': 4,
    'reconnect-delay': 2000,

    'create-id-func': null,

    'response-id': '_id',
    'response-type': '_type',
};

const webSocketPlugin = {};
webSocketPlugin.install = function( app, url, options = {} ){

    if( typeof url === 'undefined' || url === null ){
        throw 'URL is not set';
    }

    let webSocket = null;
    options = { ...defOptions, ...options };

    const send = Send( options );
    const listener = Listeners();


    let reconnectCount = 0;
    let reconnectTimeout = null;

    const setURL = (newurl) => {
        if (url !== newurl) url = newurl;
    }
    
    const open = () => {
        if( webSocket !== null )
            return false;
        if( options['debug'] === true )
            console.log( "Starting WebSocket on url: " + url );
        if(options['protocols'] !==null && options['protocols'].length > 0) { webSocket = new WebSocket( url, options['protocols'] ); webSocket.binaryType = "arraybuffer"; }
        else { webSocket = new WebSocket( url ); webSocket.binaryType = "arraybuffer"; }
        registerEvents();
    }
    const close = () => {
        if( webSocket === null )
            return false;
        if( options['debug'] === true )
            console.log( "Close connection" );
        webSocket.close();
    };
    const reconnect = () => {
        if( reconnectCount < options['max-reconnect-count'] ){

            reconnectTimeout = setTimeout( () => {
                ++reconnectCount;
                
                webSocket = null;
                open();

            }, options['reconnect-delay'] );
            
        }else{
            console.error( `Couldn't reconnect after ${reconnectCount} times.` );
        }
    };
    const registerEvents = () => {

        webSocket.onopen = event => {
            if( options['debug'] === true )
                console.log( "Connection opened!" );
            
            reconnectCount = 0;
            clearTimeout( reconnectTimeout );

            listener.fireListeners( 'onopen', event );
        };

        webSocket.onclose = event => {
            if( options['reconnect'] === true )
                reconnect();
            listener.fireListeners( 'onclose', event );
        };

        webSocket.onerror = event => {
            listener.fireListeners( 'onerror', event );
        };
        
        webSocket.onmessage = event => {
            if( options['debug'] === true )
                console.log( "Message: ", event );
            
            const data = JSON.parse( event.data );
            if( options['response-id'] in data ){
                send.fireCallback( data[ options['response-id'] ] );
                return;
            }

            const type = data[ options['response-type'] ] || 'any';
            listener.fireListeners( type, data );
        };

    }


    if( typeof url === 'object' ){
        webSocket = url;
        url = webSocket.url;
        registerEvents();
    }else if( webSocket === null && options['load-on-start'] === false ){
        open();
    }

    app.config.globalProperties.$websocket = {
        getReadyState: () => { return webSocket.readyState },

        sendAsync: ( data, args = {} ) => send.sendAsync( webSocket, data, args ),
        send: ( data, callback = null, args = {} ) => send.send( webSocket, data, callback, args ),

        setURL,
        open,
        close,

        addEventListener: listener.addEventListener,
        addStaticCallback: send.addStaticCallback,
        removeEventListener: listener.removeEventListener,
    };
};

export default webSocketPlugin;

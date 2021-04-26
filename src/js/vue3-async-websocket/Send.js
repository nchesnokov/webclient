/* eslint-disable no-console */
import { createID } from './Mixins';

const _json_pickle = (obj) => {
	if(typeof obj == 'object' && Array.isArray(obj)) for(let i = 0;i < obj.length;i++) obj[i] = _json_pickle(obj[i]);
	else if (typeof obj == 'object'){
		for(let k in obj) {
			if (['__datetime_tz__','__datetime__','__time_tz__','__time__','__date__','__timedelta__','__decimal__','__tuple__'].indexOf(k) >= 0) {
				if (k == '__decimal__') obj[k] = Number(obj[k]);
				else obj = _json_pickle(obj[k]);
			}
			else obj[k] = _json_pickle(obj[k]);
			}
		return obj;
		} 
	return obj;
}


const defSendArgs = {
    //Send
    'parse-json': true,
    

    //Timeouts
    'timeout': true,
    'max-timeout': -1,

    //Hooks
    'hooks': {
        'bad-websocket': null,
        'timed-out': null,
    },

    //Calbacks args
    'callback': {
        'send-data-only': 'message',
        'message': '_msg',
        'json-pickle': _json_pickle,
    },
};

export default ( options ) => {
    
    const callbacks = {};

    const fireCallback = ( id ) => {
        if( id in callbacks ){
            callbacks[ id ]['callback']( callbacks[ id ]['options']['send-data-only'] === 'message' ? callbacks[ id ]['options']['json-pickle'](JSON.parse( event.data )[callbacks[ id ]['options']['message']]): (callbacks[ id ]['options']['send-data-only'] === 'data' ? JSON.parse( event.data ) : event) );
            if( 'timeout' in callbacks[ id ])
                clearTimeout( callbacks[ id ]['timeout'] );
            //
              delete callbacks[ id ];
        }else{
            console.error( "ID(data._id) is passed by message, but not found in callbacks!" );
        }
    }

    const sendAsync = ( webSocket, data, args = {} ) => {
        return new Promise( ( resolve, reject ) => {
            send( webSocket, data, ( data ) => {
                resolve( data );
            }, {
                ...args,
                'hooks': {
                    'bad-websocket': () => { reject( 'Cannot send, as webSocket is null or not connected!' ); },
                    'timed-out': ( timeout ) => { reject( `No answer after ${timeout}ms!` ); },
                }
            } );
        } );
    };
    const send = ( webSocket, data, callback = null, args = {} ) => {
        args = { ...defSendArgs, ...args };

        if( webSocket === null || webSocket.readyState != 1 ){
            if( args['hooks']['bad-websocket'] !== null )
                args['hooks']['bad-websocket']();
            else
                throw "Cannot send, as webSocket is null or not connected!";
            return;
        }

        let msg = data;

        if( callback !== null ){
            const id = msg['_id'] = options['create-id-func'] === null ? 
                createID( Object.keys( callbacks ) ) : 
                options['create-id-func']( Object.keys( callbacks ) );
            
            callbacks[ id ] = {};
            callbacks[ id ]['options'] = args['callback'];
            callbacks[ id ]['callback'] = callback;
            
            if( args['timeout'] === true ){ 
                const timeout = args['max-timeout'] > 0 ? args['max-timeout'] : options['max-timeout'];
                callbacks[ id ]['timeout'] = setTimeout( () => {
                    clearTimeout( callbacks[ id ]['timeout'] );
                    delete callbacks[ id ];

                    if( args['hooks']['timed-out'] !== null )
                        args['hooks']['timed-out']( timeout );
                    else
                        throw `No answer after ${timeout}ms!`;
                }, timeout );
            }
        }
        
        if( args['parse-json'] === true )
            msg = JSON.stringify( msg );
        //

        if( options['debug'] === true )
            console.log( "Send json: ", msg );
        webSocket.send( msg );

    }
    
    const addStaticCallback = (id, callback) => {
       callbacks[ id ] = {};
       callbacks[ id ]['options'] = defSendArgs['callback'];
       callbacks[ id ]['callback'] = callback;
		};  

    return {
        send,
        sendAsync,
        addStaticCallback,
        fireCallback,
    };
};

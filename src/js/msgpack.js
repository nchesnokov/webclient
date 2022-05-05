import { encode, decode, ExtensionCodec, ExtData, decodeAsync } from "@msgpack/msgpack";

const extensionCodec = new ExtensionCodec()

async function decodeFromBlob(blob, options) {
    if (typeof blob === 'string')
        return JSON.parse(blob)
    if (blob.stream) {
        // Blob#stream(): ReadableStream<Uint8Array> (recommended)
        return await decodeAsync(blob.stream(),options);
    } else {
        // Blob#arrayBuffer(): Promise<ArrayBuffer> (if stream() is not available)
        return decode(await blob.arrayBuffer(), options);
    }
}

extensionCodec.register({
    type: 10,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__tuple__' in obj) {
            return encode(new ExtData(10, encode(obj.__tuple__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
        //console.log('decode:',data,decode(data))
        return decode(data)
    },
})

extensionCodec.register({
    type: 17,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__decimal__' in obj) return encode(new ExtData(17, encode(obj.__decimal__)))
        else return null
    },
    decode: (data) => {
        return decode(decode(data).data)
    },
})

const msgpack = {
    encode: (obj) => encode(obj, { extensionCodec }),
    decode: (data) => decodeFromBlob(data, { extensionCodec }),
    extdata: ExtData
}

export { msgpack }
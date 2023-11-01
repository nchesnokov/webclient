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
        return decode(data)
    },
})

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
        return decode(data)
    },
})

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
        return decode(data)
    },
})

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
        return decode(data)
    },
})

extensionCodec.register({
    type: 11,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__datetime_tz__' in obj) {
            return encode(new ExtData(11, encode(obj.__datetime_tz__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
        return decode(data)
    },
})

extensionCodec.register({
    type: 12,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__datetime__' in obj) {
            return encode(new ExtData(12, encode(obj.__datetime__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
        return decode(data)
    },
})

extensionCodec.register({
    type: 13,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__date__' in obj) {
            return encode(new ExtData(13, encode(obj.__date__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
        return decode(data)
    },
})


extensionCodec.register({
    type: 14,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__time_tz__' in obj) {
            return encode(new ExtData(14, encode(obj.__time_tz__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
        return decode(data)
    },
})

extensionCodec.register({
    type: 15,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__time__' in obj) {
            return encode(new ExtData(15, encode(obj.__time__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
        return decode(data)
    },
})

extensionCodec.register({
    type: 16,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__timedelta__' in obj) {
            return encode(new ExtData(16, encode(obj.__timedelta__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
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
        console.log('decimal:',decode(data))
        return decode(data)
    },
})

extensionCodec.register({
    type: 18,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__binary__' in obj) {
            return encode(new ExtData(19, encode(obj.__binary__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
        return decode(data)
    },
})

extensionCodec.register({
    type: 19,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__bytearray__' in obj) {
            return encode(new ExtData(19, encode(obj.__bytearray__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
        return decode(data)
    },
})

extensionCodec.register({
    type: 20,
    encode: (obj) => {
        if (typeof obj == 'object' && !Array.isArray() && '__exception__' in obj) {
            return encode(new ExtData(19, encode(obj.__exception__)))
        }
        else {
            return null
        }
    },
    decode: (data) => {
        return decode(data)
    },
})


const msgpack = {
    encode: (obj) => encode(obj, { extensionCodec }),
    decode: (data) => decodeFromBlob(data, { extensionCodec }),
    extdata: ExtData
}

export { msgpack }
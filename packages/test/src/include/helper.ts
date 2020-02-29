import nodejsCrypto from "crypto";
import "@bfchain/core-typings";
import { keypairHelper } from "@bfchain/core-crypto-tweetnacl";
import { ed2curveHelper } from "@bfchain/core-crypto-ed2curve";

const parseHashInputBinaryDataToBuffer = (data: BFChainCore.HashInputData.Binary) => {
  if (data instanceof ArrayBuffer || data instanceof SharedArrayBuffer) {
    return new Uint8Array(data);
  }
  return data;
};
const writeNodejsCryptoHash = async (hash: nodejsCrypto.Hash, data: BFChainCore.HashInputData) => {
  if ("readable" in data) {
    for await (const chunk of data.readable) {
      hash.update(parseHashInputBinaryDataToBuffer(chunk));
    }
  } else {
    hash.update(parseHashInputBinaryDataToBuffer(data));
  }
  return hash.digest();
};

export const NodeJsCryptoHelper = {
  sha256(data) {
    const hash = nodejsCrypto.createHash("sha256");
    if (data) {
      return hash.update(data).digest();
    }
    return hash;
  },
  md5(data) {
    const hash = nodejsCrypto.createHash("md5");
    if (data) {
      return hash.update(data).digest();
    }
    return hash;
  },
  ripemd160(data) {
    const hash = nodejsCrypto.createHash("ripemd160");
    if (data) {
      return hash.update(data).digest();
    }
    return hash;
  },
} as BFChainCore.CryptoHelperInterface;
export const NodeJsKeypairHelper: BFChainCore.KeypairHelperInterface = keypairHelper;

export const Ed2curveHelper: BFChainCore.Ed2curveHelperInterface = ed2curveHelper;

// const parseHashInputBinaryDataToUint8Array = (data: BFChainCore.HashInputData.Binary) => {
//   if (data instanceof ArrayBuffer || data instanceof SharedArrayBuffer) {
//     return new Uint8Array(data);
//   }
//   return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
// };
// const writeBrowserCryptoHash = async (data: BFChainCore.HashInputData) => {
//   let res: Uint8Array;
//   if ("readable" in data) {
//     const chunkList: Uint8Array[] = [];
//     let totalByteLength = 0;
//     for await (const chunk of data.readable) {
//       chunkList.push(parseHashInputBinaryDataToUint8Array(chunk));
//       totalByteLength += chunk.byteLength;
//     }
//     res = new Uint8Array(totalByteLength);
//     let offset = 0;
//     for (const chunk of chunkList) {
//       res.set(chunk, offset);
//       offset += chunk.byteLength;
//     }
//   } else {
//     res = parseHashInputBinaryDataToUint8Array(data);
//   }
//   return res;
// };
// export const BrowserCryptoHelper = {
//   async sha256(data) {
//     return crypto.subtle.digest("SHA-256", await writeBrowserCryptoHash(data));
//   },
//   md5(data) {
//     throw new Error();
//   },
//   ripemd160(data) {
//     throw new Error();
//   },
// } as BFChainCore.CryptoHelperInterface;

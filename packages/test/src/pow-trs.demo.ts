import { getHexFromArrayBuffer, parseHexToArrayBuffer, bfchainCore } from "./include";
import { Message, Type, Field, Writer } from "./@bfchain/protobuf";
import JSBI from "./jsbi";
const keypairHelper = bfchainCore.keypairHelper;
const asymmetricHelper = bfchainCore.asymmetricHelper;
const cryptoHelper = bfchainCore.cryptoHelper;
const keypair = keypairHelper.create("1");

@Type.d("FackTransactionMessage")
class FackTransactionMessage extends Message<FackTransactionMessage> {
  static INC = 1;
  @Field.d(FackTransactionMessage.INC++, "bytes")
  signatureBuffer!: Uint8Array;
  get signature(): string {
    return getHexFromArrayBuffer(this.signatureBuffer);
  }
  set signature(value: string) {
    this.signatureBuffer = parseHexToArrayBuffer(value);
  }
  @Field.d(FackTransactionMessage.INC++, "string")
  senderId!: string;
  @Field.d(FackTransactionMessage.INC++, "string")
  recipientId!: string;
  @Field.d(FackTransactionMessage.INC++, "fixed32")
  nonce!: number;
  @Field.d(FackTransactionMessage.INC++, "string")
  amount!: string;
}

// const trs = FackTransactionMessage.fromObject({
//   senderId: "qaq",
//   recipientId: "bbb",
//   nonce: 0,
// });
// const buf = FackTransactionMessage.encode(trs).finish();
// for (let i = 0; i < 3; i++) {
//   trs.nonce = i * 10;
//   const buf = FackTransactionMessage.encode(trs).finish();
//   console.log(buf);
// }
// console.log(FackTransactionMessage.$type.decode.toString());
// console.log(FackTransactionMessage.$type.encode.toString());

// const with_nonce_length = buf.length + 5;
// const with_nonce_arraybuffer = new ArrayBuffer(with_nonce_length);
// const with_nonce_uint8array = new Uint8Array(with_nonce_arraybuffer);
// with_nonce_uint8array.set(buf, 0);
// with_nonce_uint8array.set([29], buf.length);
// console.log(Buffer.from(with_nonce_uint8array));

// const with_nonce_dataview = new DataView(with_nonce_arraybuffer);

// with_nonce_dataview.setUint32(with_nonce_dataview.byteLength - 4, 1, true);
// console.log(Buffer.from(with_nonce_uint8array));

// console.log(FackTransactionMessage.decode(with_nonce_uint8array));
// const w = Writer.create();

// console.log(FackTransactionMessage.$type.fields["nonce"].id);

const BI_2_32 = JSBI.BigInt(32);
const BI_2_16 = JSBI.BigInt(16);
const BI_2_8 = JSBI.BigInt(8);
function getUintX(dv: DataView, X: number) {
  let BI_res = JSBI.BigInt(0);
  let offset = 0;
  while (X > 0) {
    if (X >= 32) {
      const BI_val = JSBI.BigInt(dv.getUint32(offset));
      BI_res = JSBI.add(JSBI.leftShift(BI_res, BI_2_32), BI_val);
      offset += 32;
      X -= 32;
    } else if (X >= 16) {
      const BI_val = JSBI.BigInt(dv.getUint16(offset));
      BI_res = JSBI.add(JSBI.leftShift(BI_res, BI_2_16), BI_val);
      offset += 16;
      X -= 16;
    } else if (X >= 8) {
      const BI_val = JSBI.BigInt(dv.getUint8(offset));
      BI_res = JSBI.add(JSBI.leftShift(BI_res, BI_2_8), BI_val);
      offset += 8;
      X -= 8;
    } else {
      const binary_num = dv.getUint8(offset) >> X;
      const BI_val = JSBI.BigInt(binary_num);
      BI_res = JSBI.add(JSBI.leftShift(BI_res, JSBI.BigInt(X)), BI_val);
      offset += X;
      X -= X;
    }
  }
  return BI_res;
}

interface NonceTransaction extends Message<NonceTransaction> {
  signatureBuffer: Uint8Array;
  nonce: number;
}

function* nonceWriter<T extends NonceTransaction>(trs: T) {
  /// 拷贝一份trs
  trs = trs.$type.decode(trs.$type.encode(trs).finish()) as T;
  const Ctor = trs.$type.ctor;
  const nonce_id = trs.$type.fields["nonce"].id;

  /// 强制将nonce归零
  if (!trs.nonce) {
    trs.nonce = 0;
  }
  /// 强制将signture归零
  if (trs.signatureBuffer && trs.signatureBuffer.length) {
    trs.signatureBuffer = new Uint8Array(0);
  }

  /// 获取最基础的交易体
  const buf_0 = new Uint8Array(trs.$type.encode(trs).finish());
  yield { uint8array: buf_0, nonce: 0 };

  /// 获取nonce为1的交易体
  trs.nonce = 1;
  const buf_1 = new Uint8Array(trs.$type.encode(trs).finish());
  yield { uint8array: buf_1, nonce: 1 };
  /// 获取nonce为2的交易体
  trs.nonce = 2;
  const buf_2 = new Uint8Array(trs.$type.encode(trs).finish());
  yield { uint8array: buf_2, nonce: 2 };
  /// 对比1与2交易体的差异位，从那一位起步就是nonce的未知
  let nonce_offset = 0;
  for (let i = 0; i < buf_1.length; i++) {
    if (buf_1[i] !== buf_2[i]) {
      nonce_offset = i;
      break;
    }
  }

  for (let nonce = 3; nonce < 4294967296; nonce++) {
    const with_nonce_length = buf_2.length;
    const with_nonce_arraybuffer = new ArrayBuffer(with_nonce_length);
    const with_nonce_uint8array = new Uint8Array(with_nonce_arraybuffer);
    with_nonce_uint8array.set(buf_2, 0);
    const with_nonce_dataview = new DataView(with_nonce_arraybuffer);
    with_nonce_dataview.setUint32(nonce_offset - 4, nonce, true);
    yield { uint8array: with_nonce_uint8array, nonce };
  }
}

const trs = FackTransactionMessage.fromObject({
  senderId: "qaq",
  recipientId: "bcb",
  amount: "100",
});
let i = 0;
// /**难度值 */
// const difficult = 1;

// const

const TOTAL = 1024;
const ui8Map: { [v: number]: number } = {};
for (const { uint8array: arraybuffer, nonce } of nonceWriter(trs)) {
  const buffer = Buffer.from(arraybuffer);
  const signatureBuffer = asymmetricHelper.detachedSign(buffer, keypair.secretKey);

  const shaBuffer = cryptoHelper
    .sha256()
    .update(signatureBuffer)
    .digest();

  console.log(shaBuffer.toString("hex").length);

  const dv = new DataView(shaBuffer.buffer);
  const ui8 = dv.getUint8(2);
  ui8Map[ui8] = (ui8Map[ui8] || 0) + 1;

  if (i % 100 == 0) {
    console.log(((i / TOTAL) * 100).toFixed(2) + "%");
  }
  if (i++ > TOTAL) {
    break;
  }
}

console.log(ui8Map);
// Math.log2(100 * 101);

// 01010101     11111111111111
// shaBuffer < (ffffffffffffff / 100)

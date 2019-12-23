import { Injectable, Inject } from "@bfchain/util";

const FORZEN_ENCODED_RES_WM = new WeakMap<Uint8Array, string>();

@Injectable()
export class Base58Helper {
  constructor(
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("Buffer") public Buffer: BFChainUtil.BufferConstructor,
  ) {}
  bs58 = new BaseX(ALPHABET);

  sha256x2(buffer: Uint8Array) {
    const tmp = this.cryptoHelper
      .sha256()
      .update(buffer)
      .digest();
    return this.cryptoHelper
      .sha256()
      .update(tmp)
      .digest();
  }

  encode(payload: Uint8Array) {
    const cachedRes = FORZEN_ENCODED_RES_WM.get(payload);
    if (cachedRes) return cachedRes;

    const result = this.bs58.encode(
      this.Buffer.concat([payload, this.sha256x2(payload)], payload.length + 4),
    );
    if (Object.isFrozen(payload)) {
      FORZEN_ENCODED_RES_WM.set(payload, result);
    }
    return result;
  }

  decodeRaw(buffer: Uint8Array) {
    var payload = buffer.slice(0, -4);
    var checksum = buffer.slice(-4);
    var newChecksum = this.sha256x2(payload);

    if (
      (checksum[0] ^ newChecksum[0]) |
      (checksum[1] ^ newChecksum[1]) |
      (checksum[2] ^ newChecksum[2]) |
      (checksum[3] ^ newChecksum[3])
    )
      return;

    return this.Buffer.from(payload);
  }

  decodeUnsafe(string: string) {
    var buffer = this.bs58.decodeUnsafe(string);
    if (!buffer) return;

    return this.decodeRaw(buffer);
  }

  decode(string: string) {
    var buffer = this.bs58.decode(string);
    var payload = this.decodeRaw(buffer);
    if (!payload) throw new Error("Invalid checksum");
    return payload;
  }
}
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

class BaseX {
  BASE: number;
  ALPHABET_MAP: { [key: string]: number | undefined };
  ALPHABET: string;
  LEADER: string;
  constructor(ALPHABET: string) {
    this.ALPHABET = ALPHABET;
    this.ALPHABET_MAP = {};
    this.BASE = ALPHABET.length;
    this.LEADER = ALPHABET.charAt(0);

    // pre-compute lookup table
    for (var z = 0; z < ALPHABET.length; z++) {
      var x = ALPHABET.charAt(z);

      if (this.ALPHABET_MAP[x] !== undefined) throw new TypeError(x + " is ambiguous");
      this.ALPHABET_MAP[x] = z;
    }
  }

  encode(source: Uint8Array) {
    if (source.length === 0) return "";

    var digits = [0];
    for (var i = 0; i < source.length; ++i) {
      for (var j = 0, carry = source[i]; j < digits.length; ++j) {
        carry += digits[j] << 8;
        digits[j] = carry % this.BASE;
        carry = (carry / this.BASE) | 0;
      }

      while (carry > 0) {
        digits.push(carry % this.BASE);
        carry = (carry / this.BASE) | 0;
      }
    }

    var string = "";

    // deal with leading zeros
    for (var k = 0; source[k] === 0 && k < source.length - 1; ++k) string += this.ALPHABET[0];
    // convert digits to a string
    for (var q = digits.length - 1; q >= 0; --q) string += this.ALPHABET[digits[q]];

    return string;
  }

  decodeUnsafe(string: string) {
    if (string.length === 0) return new Uint8Array();

    var bytes = [0];
    for (var i = 0; i < string.length; i++) {
      var value = this.ALPHABET_MAP[string[i]];
      if (value === undefined) return;

      for (var j = 0, carry = value; j < bytes.length; ++j) {
        carry += bytes[j] * this.BASE;
        bytes[j] = carry & 0xff;
        carry >>= 8;
      }

      while (carry > 0) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }

    // deal with leading zeros
    for (var k = 0; string[k] === this.LEADER && k < string.length - 1; ++k) {
      bytes.push(0);
    }

    return new Uint8Array(bytes).reverse();
  }

  decode(string: string) {
    var buffer = this.decodeUnsafe(string);
    if (buffer) return buffer;

    throw new Error("Non-base" + this.BASE + " character");
  }
}

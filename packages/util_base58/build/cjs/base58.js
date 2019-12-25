"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
class Base58 {
    constructor(ALPHABET = DEFAULT_ALPHABET) {
        this.ALPHABET = ALPHABET;
        this.BASE = this.ALPHABET.length;
        this.ALPHABET_MAP = {};
        this.LEADER = this.ALPHABET.charAt(0);
        // pre-compute lookup table
        for (var z = 0; z < ALPHABET.length; z++) {
            var x = ALPHABET.charAt(z);
            if (this.ALPHABET_MAP[x] !== undefined)
                throw new TypeError(x + " is ambiguous");
            this.ALPHABET_MAP[x] = z;
        }
    }
    encode(source) {
        if (source.length === 0)
            return "";
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
        for (var k = 0; source[k] === 0 && k < source.length - 1; ++k)
            string += this.ALPHABET[0];
        // convert digits to a string
        for (var q = digits.length - 1; q >= 0; --q)
            string += this.ALPHABET[digits[q]];
        return string;
    }
    decodeUnsafe(string) {
        if (string.length === 0)
            return new Uint8Array();
        var bytes = [0];
        for (var i = 0; i < string.length; i++) {
            var value = this.ALPHABET_MAP[string[i]];
            if (value === undefined)
                return;
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
    decode(string) {
        var buffer = this.decodeUnsafe(string);
        if (buffer)
            return buffer;
        throw new Error("Non-base" + this.BASE + " character");
    }
}
exports.Base58 = Base58;
exports.base58 = new Base58();
//# sourceMappingURL=base58.js.map
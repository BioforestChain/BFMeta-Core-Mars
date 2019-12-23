import { Injectable, Inject } from "@bfchain/util";
import { base58 } from "@bfchain/core-util-base58";

const FORZEN_ENCODED_RES_WM = new WeakMap<Uint8Array, string>();

@Injectable()
export class Base58Helper {
  constructor(
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("Buffer") public Buffer: BFChainUtil.BufferConstructor,
  ) {}
  bs58 = base58;

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

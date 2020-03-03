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

  async sha256x2(buffer: Uint8Array) {
    const tmp = await this.cryptoHelper.sha256(buffer);
    return this.cryptoHelper.sha256(tmp);
  }

  async encode(payload: Uint8Array) {
    const cachedRes = FORZEN_ENCODED_RES_WM.get(payload);
    if (cachedRes) return cachedRes;

    const result = this.bs58.encode(
      this.Buffer.concat([payload, await this.sha256x2(payload)], payload.length + 4),
    );
    if (Object.isFrozen(payload)) {
      FORZEN_ENCODED_RES_WM.set(payload, result);
    }
    return result;
  }

  async decodeRaw(buffer: Uint8Array) {
    let payload = buffer.slice(0, -4);
    let checksum = buffer.slice(-4);
    let newChecksum = await this.sha256x2(payload);

    if (
      (checksum[0] ^ newChecksum[0]) |
      (checksum[1] ^ newChecksum[1]) |
      (checksum[2] ^ newChecksum[2]) |
      (checksum[3] ^ newChecksum[3])
    )
      return;

    return this.Buffer.from(payload);
  }

  async decodeUnsafe(string: string) {
    let buffer = await this.bs58.decodeUnsafe(string);
    if (!buffer) return;

    return this.decodeRaw(buffer);
  }

  async decode(string: string) {
    let buffer = this.bs58.decode(string);
    let payload = await this.decodeRaw(buffer);
    if (!payload) throw new Error("Invalid checksum");
    return payload;
  }
}

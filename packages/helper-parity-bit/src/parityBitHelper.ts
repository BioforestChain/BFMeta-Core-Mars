/// <reference lib="dom"/>
import { Injectable } from "@bfchain/util-dep-inject";
import { PARITY_BIT_MAPPING } from "@bfchain/core-model-constants";

@Injectable()
export class ParityBitHelper {
  /**
   * 计算校验位
   *
   * 每个字符的 ascii 值相加 * 每轮的区块数 * 打块间隔 % （大写字母个数 26 + 数字个数 10）
   * @param baseString
   */
  calcParityBit(baseString: string) {
    let sum = 0;
    for (let i = 0; i < baseString.length; i++) {
      sum += baseString.charCodeAt(i);
    }
    return sum % 36;
  }

  shuffle(arr: (string | number)[]) {
    let i = arr.length;
    while (i) {
      const j = Math.floor(Math.random() * i--);
      [arr[j], arr[i]] = [arr[i], arr[j]];
    }
    return arr;
  }

  private __getRandomString(strLength: number) {
    // magic 4 位
    const words: (string | number)[] = [];
    for (let i = 0; i < 10; i++) {
      words[words.length] = i;
    }
    for (let i = 65; i < 91; i++) {
      words[words.length] = String.fromCharCode(i);
    }
    const randomWrods = this.shuffle(words);
    let newMagic = "";
    for (let i = 0; i < strLength; i++) {
      newMagic += randomWrods[Math.floor(Math.random() * strLength)];
    }

    return newMagic;
  }

  private __addParityBit(str: string) {
    const parityBitCode = this.calcParityBit(str);
    const mapKey = `P_${parityBitCode}` as BFChainCore.PARITY_BIT_MAPPING;
    return str + PARITY_BIT_MAPPING[mapKey];
  }

  createMagic(magic?: string) {
    if (magic) {
      if (typeof magic !== "string") {
        throw new Error(`Not a valid magic ${magic}`);
      }
      const pattern = new RegExp("^[A-Z0-9]{4}$");
      if (!pattern.test(magic)) {
        throw new Error(`Not a valid magic ${magic}`);
      }
    } else {
      magic = this.__getRandomString(4);
    }

    return this.__addParityBit(magic);
  }

  createDAppId(dappid?: string) {
    if (dappid) {
      if (typeof dappid !== "string") {
        throw new Error(`Not a valid dappid ${dappid}`);
      }
      const pattern = new RegExp("^[A-Z0-9]{7}$");
      if (!pattern.test(dappid)) {
        throw new Error(`Not a valid dappid ${dappid}`);
      }
    } else {
      dappid = this.__getRandomString(7);
    }

    return this.__addParityBit(dappid);
  }
}

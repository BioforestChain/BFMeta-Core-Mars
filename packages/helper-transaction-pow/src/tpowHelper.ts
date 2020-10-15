import type {} from "@bfchain/util-buffer";
import { Injectable, Inject } from "@bfchain/util-dep-inject";
import { cacheGetter } from "@bfchain/util-decorator";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { JSBIHelper } from "@bfchain/core-helper-bigint";
import { TPOWDiffHelper } from "./tpowDiffHelper";

// @Injectable()
// export class TPOWHelper {
//   constructor(
//     private config: ConfigHelper,
//     private jsbiHelper: JSBIHelper,
//     private tpowDiffHelper: TPOWDiffHelper,
//     @Inject("Buffer") private Buffer: BFChainUtil.BufferConstructor,
//   ) {}

//   calcTpowParticipationBI(txCount: number, txBalance: string) {
//     return BigInt(txCount + 1) * BigInt(txBalance);
//   }

//   @cacheGetter
//   private get participationRatioBI(): BFChainCore.FractionJSON<bigint> {
//     const blockParticipationWeightRatio = this.config.blockParticipationWeightRatio;
//     return {
//       numerator: BigInt(blockParticipationWeightRatio.prevWeight),
//       denominator: BigInt(blockParticipationWeightRatio.nextWeight),
//     };
//   }

//   /**
//    * 根据参与度计算一轮需要在线的时间
//    * 0.2* Round ~ 1.3* Round
//    */
//   calcNeedOnlineTime(participation: string | number | bigint) {
//     const { participationRatioBI } = this;
//     /**
//      * Tpow participation
//      * 将参与度乘上参与度比重,并除以 1000 * 1e8 (x千个BFT)
//      * 而后转为普通js数值,因为极值是>280,所以不用担心精度丢失的问题
//      */
//     const x =
//       Number(this.jsbiHelper.multiplyCeilFraction(participation, participationRatioBI)) / 1e11;
//     /**
//      * Need Online Time
//      * 计算出一轮需要在线时间
//      */
//     const y1 = 0.238536212611 / (1 - 0.7936005508148 * Math.E ** (-0.0847138128036 * x));

//     //#region
//     /*
//      * 反向推理出到达 24亿
//      * 100_0000/z**4 1
//      * 100_0000/z**3 2
//      * 100_0000/z**2 3
//      * 100_0000/z 4
//      * 100_0000 5
//      * 100_0000*z**1 6
//      * 100_0000*z**2 7
//      * 1000_0000 8
//      * 1000_0000*z**1 9
//      * 1000_0000*z**2 10
//      * 1_0000_0000 11
//      * 10_0000_0000 14 60
//      * 10_0000_0000*z 15
//      */
//     const participationNum = Number(participation) / 1e8;
//     if (participationNum > 100_0000) {
//       const E = Math.cbrt(10);
//       const BE = 100_0000 / E ** 4;
//       const M0 = (P: number) => Math.log(P / BE) / Math.log(E);
//       /// 4~57
//       const n = 176 / 53;
//       const m = 4 / (4 - n);
//       const BR = (M0(participationNum) - n) * m;

//       const y2 = 1 / BR;
//       /// 返回在线时间最少的
//       if (y2 < y1) {
//         return y2;
//       }
//     }
//     //#endregion
//     return y1;
//   }

//   isValidTpowDiffFormula(tpowDiffFormula: string) {
//     return this.tpowDiffHelper.isValidTpowDiffFormula(tpowDiffFormula);
//   }

//   /**
//    * 计算交易POW的难度
//    *
//    * @param tpowDiffOptions
//    */
//   calcDiffOfTransactionProfOfWork(tpowDiffOptions: BFChainCore.TPOWDiffCalculateOptions) {
//     return this.tpowDiffHelper.calcDiffOfTransactionProfOfWork(tpowDiffOptions);
//   }

//   /**
//    * 校验交易POW
//    *
//    * @param signatureBuffer
//    * @param tpowDiffOptions
//    * @param diff_BI
//    */
//   async checkTransactionProfOfWork(
//     signatureBuffer: Uint8Array,
//     tpowDiffOptions: BFChainCore.TPOWDiffCalculateOptions,
//     diff_BI?: bigint,
//   ) {
//     diff_BI || (diff_BI = this.calcDiffOfTransactionProfOfWork(tpowDiffOptions));
//     if (!diff_BI) {
//       return true;
//     }
//     /**得分应该读取多少位数，至少8位 */
//     const X = Math.max(
//       Math.min(
//         Math.ceil(Math.log2(Number(diff_BI * (BigInt(1) + diff_BI)))),
//         signatureBuffer.length,
//       ),
//       8,
//     );
//     /**总共的分数 */
//     const hit_numerator_BI = BigInt(2) << BigInt(X - 1);
//     /**将分数基于diff来细分成diff份，得分必须小于最小的一份 */
//     const max_score_BI = hit_numerator_BI / diff_BI;
//     /**读取出交易的得分 */
//     const score_BI = this.getUintN(this.Buffer.from(signatureBuffer), X);
//     return score_BI < max_score_BI;
//   }
//   /**交易的噪点生成器 */
//   *nonceWriter<T extends BFChainCore.Transaction>(trs: T) {
//     /// 拷贝一份没有signature的trs
//     trs = trs.$type.decode(trs.getBytes(true, true)) as T;

//     /// 强制将nonce归零
//     if (!trs.nonce) {
//       trs.nonce = 0;
//     }

//     /// 获取最基础的交易体
//     const buf_0 = new Uint8Array(trs.$type.encode(trs).finish());
//     yield { uint8array: buf_0, nonce: 0 };

//     /// 获取nonce为1的交易体
//     trs.nonce = 1;
//     const buf_1 = new Uint8Array(trs.$type.encode(trs).finish());
//     yield { uint8array: buf_1, nonce: 1 };
//     /// 获取nonce为2的交易体
//     trs.nonce = 2;
//     const buf_2 = new Uint8Array(trs.$type.encode(trs).finish());
//     yield { uint8array: buf_2, nonce: 2 };
//     /// 对比1与2交易体的差异位，从那一位起步就是nonce的未知
//     let nonce_offset = 0;
//     for (let i = 0; i < buf_1.length; i++) {
//       if (buf_1[i] !== buf_2[i]) {
//         nonce_offset = i;
//         break;
//       }
//     }

//     for (let nonce = 3; nonce < 4294967296; nonce++) {
//       const with_nonce_length = buf_2.length;
//       const with_nonce_arraybuffer = new ArrayBuffer(with_nonce_length);
//       const with_nonce_uint8array = new Uint8Array(with_nonce_arraybuffer);
//       with_nonce_uint8array.set(buf_2, 0);
//       const with_nonce_dataview = new DataView(with_nonce_arraybuffer);
//       with_nonce_dataview.setUint32(nonce_offset, nonce, true);
//       yield { uint8array: with_nonce_uint8array, nonce, offset: nonce_offset };
//     }
//   }

//   private BI_2_32 = BigInt(32);
//   private BI_2_16 = BigInt(16);
//   private BI_2_8 = BigInt(8);

//   /**读取一个二进制的n位数据作为BigInt数字 */
//   getUintN(dv: BFChainUtil.Buffer, N: number) {
//     let BI_res = BigInt(0);
//     let offset = 0;
//     while (N > 0) {
//       if (N >= 32) {
//         const BI_val = BigInt(dv.readUInt32BE(offset));
//         BI_res = (BI_res << this.BI_2_32) + BI_val;
//         offset += 4;
//         N -= 32;
//       } else if (N >= 16) {
//         const BI_val = BigInt(dv.readUInt16BE(offset));
//         BI_res = (BI_res << this.BI_2_16) + BI_val;
//         offset += 2;
//         N -= 16;
//       } else if (N >= 8) {
//         const BI_val = BigInt(dv.readUInt8(offset));
//         BI_res = (BI_res << this.BI_2_8) + BI_val;
//         offset += 1;
//         N -= 8;
//       } else {
//         const binary_num = dv.readUInt8(offset) >> (8 - N);
//         const BI_val = BigInt(binary_num);
//         BI_res = (BI_res << BigInt(N)) + BI_val;
//         // offset += X;
//         N -= N;
//       }
//     }
//     return BI_res;
//   }
// }

@Injectable()
export class TPOWHelper {
  constructor(
    private config: ConfigHelper,
    private jsbiHelper: JSBIHelper,
    // @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("Buffer") private Buffer: BFChainUtil.BufferConstructor,
  ) {}

  private _cache_of_diff_numerator_BI = new Map<number, bigint>();
  private _cache_of_diff_BI = {
    num: -1,
    participation: "",
    diff_BI: BigInt(0),
  };

  @cacheGetter
  private get growthFactorBI(): BFChainCore.FractionJSON<bigint> {
    const { growthFactor } = this.config.transactionPowOfWorkConfig;
    return {
      numerator: BigInt(growthFactor.numerator),
      denominator: BigInt(growthFactor.denominator),
    };
  }
  @cacheGetter
  private get participationRatioBI(): BFChainCore.FractionJSON<bigint> {
    const { participationRatio } = this.config.transactionPowOfWorkConfig;
    return {
      numerator: BigInt(participationRatio.numerator),
      denominator: BigInt(participationRatio.denominator),
    };
  }
  @cacheGetter
  private get genesisAmountBI() {
    return BigInt(this.config.genesisAmount);
  }
  @cacheGetter
  private get MAX_SAFE_INTEGER_BI() {
    return BigInt(Number.MAX_SAFE_INTEGER);
  }
  private logBI(num: bigint) {
    const { MAX_SAFE_INTEGER_BI } = this;
    const { MAX_SAFE_INTEGER } = Number;
    if (num <= MAX_SAFE_INTEGER_BI) {
      return Math.log(Number(num));
    }
    const rate = num / MAX_SAFE_INTEGER_BI;
    if (rate >= MAX_SAFE_INTEGER_BI) {
      throw new RangeError("log bigint out range.");
    }
    /**
     * @FIXME 这里一旦rate过大，就会带来log的精度问题。但过大的rate，会在其它地方带来更多问题，而不单单是这里
     */
    const rest = Number(num - rate * MAX_SAFE_INTEGER_BI) / MAX_SAFE_INTEGER;
    return Math.log(Number(rate) + rest) + Math.log(MAX_SAFE_INTEGER);
  }

  /**
   * 困难难度分水岭
   * 这里默认难度为150b/s
   */
  @cacheGetter
  private get hardDiffThresholdBI() {
    const blockPerRoundBI = BigInt(this.config.blockPerRound);
    const forgeIntervalBI = BigInt(this.config.forgeInterval);
    return (
      (BigInt(this.config.averageComputingPower) * forgeIntervalBI * blockPerRoundBI) /
      (blockPerRoundBI - BigInt(1))
    );
  }
  // /**计算难度基数 */
  // private calcDiffBaseFloat(num: number) {
  //   const { growthFactor } = this.config.genesisBlock.remark.transactionPowOfWorkConfig;

  //   /**(E ^ N) * N */
  //   return (Number(growthFactor.numerator) / Number(growthFactor.denominator)) ** num * num;
  // }
  /**计算难度基数 */
  private calcDiffBaseBI(num: number) {
    const { growthFactorBI } = this;
    /**难度基数的分子，这个只与num有关系，所以可以进行缓存 */
    let diff_numerator_BI = this._cache_of_diff_numerator_BI.get(num);
    if (!diff_numerator_BI) {
      const num_BI = BigInt(num);
      const growthFactor_numerator_BI = growthFactorBI.numerator;
      const growthFactor_denominator_BI = growthFactorBI.denominator;
      /**(E ^ N) */
      const BI_1 = growthFactor_numerator_BI ** num_BI / growthFactor_denominator_BI ** num_BI;
      diff_numerator_BI = BI_1 * num_BI;
      this._cache_of_diff_numerator_BI.set(num, diff_numerator_BI);
    }
    return diff_numerator_BI;
  }
  /**计算难度累积值 */
  private accDiffBaseBI(num: number) {
    const rest = num % 1;
    let accDiffBI = BigInt(0);
    for (let i = 0; i <= num; i++) {
      accDiffBI += this.calcDiffBaseBI(i);
    }
    if (rest !== 0) {
      accDiffBI += this.jsbiHelper.multiplyCeilFraction(
        this.calcDiffBaseBI(num - rest + 1),
        this.jsbiHelper.numberToFraction(rest),
      );
    }
    return accDiffBI;
  }

  calcTpowParticipationBI(txCount: number, txBalance: string) {
    return BigInt(txCount + 1) * BigInt(txBalance);
  }

  /**
   * 计算交易POW的难度
   */
  calcDiffOfTransactionProfOfWork(num: number, participation: string) {
    const { _cache_of_diff_BI, hardDiffThresholdBI } = this;
    let diff_BI: bigint;
    if (_cache_of_diff_BI.num === num && _cache_of_diff_BI.participation === participation) {
      diff_BI = _cache_of_diff_BI.diff_BI;
    } else {
      const { growthFactorBI, jsbiHelper } = this;
      /**难度基数的分子，这个只与num有关系，所以可以进行缓存 */
      let diff_numerator_BI = this._cache_of_diff_numerator_BI.get(num);
      if (!diff_numerator_BI) {
        const num_BI = BigInt(num);
        const growthFactor_numerator_BI = growthFactorBI.numerator;
        const growthFactor_denominator_BI = growthFactorBI.denominator;
        /**(E ^ N) */
        const BI_1 = growthFactor_numerator_BI ** num_BI / growthFactor_denominator_BI ** num_BI;
        diff_numerator_BI = BI_1 * num_BI;
        this._cache_of_diff_numerator_BI.set(num, diff_numerator_BI);
      }
      /// 如果难度基数是0，直接跳过后面的校验计算
      if (diff_numerator_BI === BigInt(0)) {
        return diff_numerator_BI;
      }

      //#region 基于拟合曲线算出来的难度倍数
      /**
       * 得出简单与困难 交易数 的分水岭
       */
      const easyTrsPreBlock = 1 / this.calcNeedOnlineTime(participation);
      const hardTrsPreBlock = easyTrsPreBlock; /* 这里可以用于添加额外豁免,但这里默认不给予+ 1 */

      const needWorkTimes_denominator = this.accDiffBaseBI(hardTrsPreBlock);
      const needWorkTimes: BFChainCore.FractionJSON<bigint> = {
        numerator: hardDiffThresholdBI,
        denominator: needWorkTimes_denominator,
      };
      //#endregion

      diff_BI = jsbiHelper.multiplyCeilFraction(diff_numerator_BI, needWorkTimes);

      _cache_of_diff_BI.num = num;
      _cache_of_diff_BI.participation = participation;
      _cache_of_diff_BI.diff_BI = diff_BI;
    }
    return diff_BI;
  }
  /**
   * 根据参与度计算一轮需要在线的时间
   * 0.2* Round ~ 1.3* Round
   */
  calcNeedOnlineTime(participation: string | number | bigint) {
    const { participationRatioBI } = this;
    /**
     * Tpow participation
     * 将参与度乘上参与度比重,并除以 1000 * 1e8 (x千个BFT)
     * 而后转为普通js数值,因为极值是>280,所以不用担心精度丢失的问题
     */
    const x =
      Number(this.jsbiHelper.multiplyCeilFraction(participation, participationRatioBI)) / 1e11;
    /**
     * Need Online Time
     * 计算出一轮需要在线时间
     */
    const y1 = 0.238536212611 / (1 - 0.7936005508148 * Math.E ** (-0.0847138128036 * x));

    //#region
    /*
     * 反向推理出到达 24亿
     * 100_0000/z**4 1
     * 100_0000/z**3 2
     * 100_0000/z**2 3
     * 100_0000/z 4
     * 100_0000 5
     * 100_0000*z**1 6
     * 100_0000*z**2 7
     * 1000_0000 8
     * 1000_0000*z**1 9
     * 1000_0000*z**2 10
     * 1_0000_0000 11
     * 10_0000_0000 14 60
     * 10_0000_0000*z 15
     */
    const participationNum = Number(participation) / 1e8;
    if (participationNum > 100_0000) {
      const E = Math.cbrt(10);
      const BE = 100_0000 / E ** 4;
      const M0 = (P: number) => Math.log(P / BE) / Math.log(E);
      /// 4~57
      const n = 176 / 53;
      const m = 4 / (4 - n);
      const BR = (M0(participationNum) - n) * m;

      const y2 = 1 / BR;
      /// 返回在线时间最少的
      if (y2 < y1) {
        return y2;
      }
    }
    //#endregion
    return y1;
  }
  /**
   * 计算TPOW得分，如果没有分数
   * @param signatureBuffer
   * @param num
   * @param participation
   * @param diff_BI
   */
  private _calcTransactionProfOfWorkScore(
    signatureBuffer: Uint8Array,
    num: number,
    participation: string,
    diff_BI?: bigint,
  ) {
    diff_BI || (diff_BI = this.calcDiffOfTransactionProfOfWork(num, participation));
    /// diff是作为分母，要足够大才有意义
    if (diff_BI < BigInt(1)) {
      return false;
    }
    /**得分应该读取多少位数，至少8位 */
    const X = Math.max(
      Math.min(
        Math.ceil(Math.log2(Number(diff_BI * (BigInt(1) + diff_BI)))),
        signatureBuffer.length,
      ),
      8,
    );
    /**总共的分数 */
    const hit_numerator_BI = BigInt(2) << BigInt(X - 1);
    /**将分数基于diff来细分成diff份，得分必须小于最小的一份 */
    const max_score_BI = hit_numerator_BI / diff_BI;
    /**读取出交易的得分 */
    const score_BI = this.getUintN(this.Buffer.from(signatureBuffer), X);

    return {
      diff: diff_BI,
      done: score_BI <= max_score_BI,
      conditionScore: max_score_BI,
      totalScore: hit_numerator_BI,
      score: score_BI,
    };
  }
  /**
   * 计算TPOW进度
   * @returns (0~1]
   */
  async calcTransactionProfOfWorkProgress(
    signatureBuffer: Uint8Array,
    num: number,
    participation: string,
    diff_BI?: bigint,
  ) {
    const scoreInfo = this._calcTransactionProfOfWorkScore(
      signatureBuffer,
      num,
      participation,
      diff_BI,
    );

    if (!scoreInfo || scoreInfo.done) {
      return 1;
    }
    /// 用剩余得分计算进度，这里只保留小数4位
    return (
      Number(
        ((scoreInfo.score - scoreInfo.conditionScore) * this._PROGRESS_FIX_BI) /
          (scoreInfo.totalScore - scoreInfo.conditionScore),
      ) / this._PROGRESS_FIX
    );
  }
  private readonly _PROGRESS_FIX = 1e6;
  private readonly _PROGRESS_FIX_BI = BigInt(this._PROGRESS_FIX);
  /**
   * 校验交易POW
   * DIFF = (E ^ N) * N / (1 + B + P * R)
   * @param transaction 交易体
   * @param num 在一个区块中用户的第N比交易
   */
  async checkTransactionProfOfWork(
    signatureBuffer: Uint8Array,
    num: number,
    participation: string,
    diff_BI?: bigint,
  ) {
    const scoreInfo = this._calcTransactionProfOfWorkScore(
      signatureBuffer,
      num,
      participation,
      diff_BI,
    );

    if (!scoreInfo || scoreInfo.done) {
      return true;
    }
    return false;
  }
  /**交易的噪点生成器 */
  *nonceWriter<T extends BFChainCore.Transaction>(trs: T) {
    /// 拷贝一份没有signature的trs
    trs = trs.$type.decode(trs.getBytes(true, true)) as T;

    /// 强制将nonce归零
    if (!trs.nonce) {
      trs.nonce = 0;
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
      with_nonce_dataview.setUint32(nonce_offset, nonce, true);
      yield { uint8array: with_nonce_uint8array, nonce, offset: nonce_offset };
    }
  }

  private BI_2_32 = BigInt(32);
  private BI_2_16 = BigInt(16);
  private BI_2_8 = BigInt(8);

  /**读取一个二进制的n位数据作为BigInt数字 */
  getUintN(dv: BFChainUtil.Buffer, N: number) {
    let BI_res = BigInt(0);
    let offset = 0;
    while (N > 0) {
      if (N >= 32) {
        const BI_val = BigInt(dv.readUInt32BE(offset));
        BI_res = (BI_res << this.BI_2_32) + BI_val;
        offset += 4;
        N -= 32;
      } else if (N >= 16) {
        const BI_val = BigInt(dv.readUInt16BE(offset));
        BI_res = (BI_res << this.BI_2_16) + BI_val;
        offset += 2;
        N -= 16;
      } else if (N >= 8) {
        const BI_val = BigInt(dv.readUInt8(offset));
        BI_res = (BI_res << this.BI_2_8) + BI_val;
        offset += 1;
        N -= 8;
      } else {
        const binary_num = dv.readUInt8(offset) >> (8 - N);
        const BI_val = BigInt(binary_num);
        BI_res = (BI_res << BigInt(N)) + BI_val;
        // offset += X;
        N -= N;
      }
    }
    return BI_res;
  }
}

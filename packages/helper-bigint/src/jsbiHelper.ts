import { Injectable } from "@bfchain/util-dep-inject";
import { ERROR_LIST } from "@bfchain/core-util-exception-errorcode";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";

const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "jsbiHelper");
type BI = bigint | number | string;

/**
 * 格式化参数
 *
 * @param param
 */
function formatParam(param: BI) {
  try {
    if (typeof param === "string") {
      param = parseInt(param);
    } else if (typeof param === "number") {
      param = Math.floor(param);
    } else {
      return param;
    }
    return BigInt(param);
  } catch (err) {
    throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
      prop: `param ${param}`,
      type: "jsbi|string|number",
    });
  }
}

@Injectable()
export class JSBIHelper {
  /**
   * 向下取整
   *
   * @param z
   */
  multiplyFloor(x: BI, y: number) {
    return this.multiplyFloorFraction(x, this.numberToFraction(y));
  }
  /**
   * 分数下取整
   *
   * @param x
   * @returns
   */
  floorFraction(x: BFChainCore.FractionJSON<BI>) {
    const numerator = formatParam(x.numerator);
    const denominator = formatParam(x.denominator);
    return numerator / denominator;
  }
  /**
   * 分数上取整
   *
   * @param x
   * @returns
   */
  ceilFraction(x: BFChainCore.FractionJSON<BI>) {
    const numerator = formatParam(x.numerator);
    const denominator = formatParam(x.denominator);
    const result = numerator / denominator;
    // 如果能够正确还原，说明是整除
    if (result * denominator === numerator) {
      return result;
    }
    return result + BigInt(1);
  }
  /**
   * 两个分数相乘
   *
   * @param x
   * @param y
   */
  multiplyFraction(
    x: BFChainCore.FractionJSON<BI>,
    y: BFChainCore.FractionJSON<BI>,
  ): BFChainCore.FractionJSON<bigint> {
    const numeratorX = BigInt(x.numerator);
    const denominatorX = BigInt(x.denominator);
    const numeratorY = BigInt(y.numerator);
    const denominatorY = BigInt(y.denominator);
    return {
      numerator: numeratorX * numeratorY,
      denominator: denominatorX * denominatorY,
    };
  }
  /**
   * 两个分数相乘，并且下取整
   *
   * @param x
   * @param y
   */
  multiplyFractionAndFloor(x: BFChainCore.FractionJSON<BI>, y: BFChainCore.FractionJSON<BI>) {
    return this.floorFraction(this.multiplyFraction(x, y));
  }
  /**
   * 两个分数相乘，并且下取整
   *
   * @param x
   * @param y
   */
  multiplyFractionAndCeil(x: BFChainCore.FractionJSON<BI>, y: BFChainCore.FractionJSON<BI>) {
    return this.ceilFraction(this.multiplyFraction(x, y));
  }
  /**
   * 与分数相乘，向下取整
   *
   * @param z
   */
  multiplyFloorFraction(x: BI, y: BFChainCore.FractionJSON<BI>) {
    const formatX = formatParam(x);
    const numerator = BigInt(y.numerator);
    const denominator = BigInt(y.denominator);
    /// 乘分子，除分母。自动丢失精度
    const xn = formatX * numerator;
    return xn / denominator;
  }

  multiplyFloorFractionString(x: BI, y: { numerator: BI; denominator: BI }) {
    const formatX = formatParam(x);
    const numerator = BigInt(y.numerator);
    const denominator = BigInt(y.denominator);
    /// 乘分子，除分母。自动丢失精度
    const xn = formatX * numerator;
    return xn / denominator;
  }

  /**
   * 四舍五入
   *
   * @param z
   */
  multiplyRound(x: BI, y: number) {
    return this.multiplyRoundFraction(x, this.numberToFraction(y));
  }
  /**
   * 与分数相乘，四舍五入
   *
   * @param z
   */
  multiplyRoundFraction(x: BI, y: BFChainCore.FractionJSON<BI>) {
    const z = this.multiplyFloorFraction(x, {
      numerator: BigInt(y.numerator) * BigInt(10),
      denominator: BigInt(y.denominator),
    });
    const result = z / BigInt(10);
    if (z % BigInt(10) >= BigInt(5)) {
      return result + BigInt(1);
    }
    return result;
  }

  /**number转分数 */
  numberToFraction(y: number) {
    const y_str = y.toFixed(45);
    // bug  Math.pow(10, 21) => 1e+21 4.019276798087129 => 4019276798087129.5
    // 找到小数点的位置
    // const y_dot_index = y_str.indexOf(".");
    // const y_float_str_length = y_dot_index === -1 ? 0 : y_str.length - y_dot_index - 1;
    // const denominator = Math.pow(10, y_float_str_length);
    // const numerator = y * denominator;
    // return { numerator, denominator } as BFChainCore.FractionJSON<number>;
    const y_str_list = y_str.split(".");
    const y_float_str_length = y_str_list.length > 1 ? y_str_list[1].length : 0;
    const denominator = 1 + "0".repeat(y_float_str_length);
    const numerator = y_str_list.join("");
    return { numerator, denominator } as BFChainCore.FractionJSON<string>;
  }
  /**
   * 向上取整
   *
   * @param z
   */
  multiplyCeil(x: BI, y: number) {
    return this.multiplyCeilFraction(x, this.numberToFraction(y));
  }
  /**
   * 与分数相乘，向上取整
   *
   * @param z
   */
  multiplyCeilFraction(x: BI, y: BFChainCore.FractionJSON<BI>) {
    const formatX = formatParam(x);
    const numerator = BigInt(y.numerator);
    const denominator = BigInt(y.denominator);
    /// 乘分子，除分母
    const xn = formatX * numerator;
    const result = xn / denominator;
    // 如果能够正确还原，说明是整除
    if (result * denominator === xn) {
      return result;
    }
    return result + BigInt(1);
  }
  /**
   * 与分数相除，向上取整
   *
   * @param x
   * @param y
   */
  divisionCeilFraction(x: BI, y: BFChainCore.FractionJSON<BI>) {
    const formatX = formatParam(x);
    const numerator = BigInt(y.numerator);
    const denominator = BigInt(y.denominator);
    /// 乘分子，除分母
    const xn = formatX * denominator;
    const result = xn / numerator;
    // 如果能够正确还原，说明是整除
    if (result * numerator === xn) {
      return result;
    }
    return result + BigInt(1);
  }
  /**
   * 两个分数相除
   *
   * @param x
   * @param y
   */
  divisionFraction(
    x: BFChainCore.FractionJSON<BI>,
    y: BFChainCore.FractionJSON<BI>,
  ): BFChainCore.FractionJSON<bigint> {
    const numeratorX = BigInt(x.numerator);
    const denominatorX = BigInt(x.denominator);
    const numeratorY = BigInt(y.numerator);
    const denominatorY = BigInt(y.denominator);
    return {
      numerator: numeratorX * denominatorY,
      denominator: denominatorX * numeratorY,
    };
  }
  /**
   * 两个分数相除，并且下取整
   *
   * @param x
   * @param y
   */
  divisionFractionAndFloor(x: BFChainCore.FractionJSON<BI>, y: BFChainCore.FractionJSON<BI>) {
    return this.floorFraction(this.divisionFraction(x, y));
  }
  /**
   * 两个分数相除，并且下取整
   *
   * @param x
   * @param y
   */
  divisionFractionAndCeil(x: BFChainCore.FractionJSON<BI>, y: BFChainCore.FractionJSON<BI>) {
    return this.ceilFraction(this.divisionFraction(x, y));
  }
  /**
   * 比较两个分数的大小
   *
   * @return 0: fraction1 === fraction2
   * @return 1: fraction1 > fraction2
   * @return -1: fraction1 < fraction2
   *
   * @param fraction1
   * @param fraction2
   */
  compareFraction(
    fraction1: BFChainCore.FractionJSON<BI>,
    fraction2: BFChainCore.FractionJSON<BI>,
  ) {
    const frac1Numerator = formatParam(fraction1.numerator);
    const frac1Denominator = formatParam(fraction1.denominator);
    const frac2Numerator = formatParam(fraction2.numerator);
    const frac2Denominator = formatParam(fraction2.denominator);
    const frac1 = frac1Numerator * frac2Denominator;
    const frac2 = frac2Numerator * frac1Denominator;
    return frac1 === frac2 ? 0 : frac1 > frac2 ? 1 : -1;
  }
}

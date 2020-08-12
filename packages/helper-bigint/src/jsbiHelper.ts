import { Injectable } from "@bfchain/util";
import { PROP_IS_INVALID } from "@bfchain/core-util-exception-errorcode";
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
    throw new ArgumentIllegalException(PROP_IS_INVALID, {
      prop: "param",
      type: "jsbi|string|number",
      function: "formatParam",
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
    const y_str = y.toString();
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

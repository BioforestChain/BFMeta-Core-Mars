"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@bfchain/util");
const core_util_exception_errorcode_1 = require("@bfchain/core-util-exception-errorcode");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("HELPER", "jsbiHelper");
/**
 * 格式化参数
 *
 * @param param
 */
function formatParam(param) {
    try {
        return BigInt(param);
    }
    catch (err) {
        throw new ArgumentIllegalException(core_util_exception_errorcode_1.PROP_IS_INVALID, {
            prop: "param",
            type: "jsbi|string|number",
            function: "formatParam",
        });
    }
}
let JSBIHelper = class JSBIHelper {
    /**
     * 向下取整
     *
     * @param z
     */
    multiplyFloor(x, y) {
        return this.multiplyFloorFraction(x, this.numberToFraction(y));
    }
    /**
     * 与分数相乘，向下取整
     *
     * @param z
     */
    multiplyFloorFraction(x, y) {
        const formatX = formatParam(x);
        const numerator = BigInt(y.numerator);
        const denominator = BigInt(y.denominator);
        /// 乘分子，除分母。自动丢失精度
        const xn = formatX * numerator;
        return xn / denominator;
    }
    multiplyFloorFractionString(x, y) {
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
    multiplyRound(x, y) {
        return this.multiplyRoundFraction(x, this.numberToFraction(y));
    }
    /**
     * 与分数相乘，四舍五入
     *
     * @param z
     */
    multiplyRoundFraction(x, y) {
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
    numberToFraction(y) {
        const y_str = y.toString();
        // 找到小数点的位置
        const y_dot_index = y_str.indexOf(".");
        const y_float_str_length = y_dot_index === -1 ? 0 : y_str.length - y_dot_index - 1;
        const denominator = Math.pow(10, y_float_str_length);
        const numerator = y * denominator;
        return { numerator, denominator };
    }
    /**
     * 向上取整
     *
     * @param z
     */
    multiplyCeil(x, y) {
        return this.multiplyCeilFraction(x, this.numberToFraction(y));
    }
    /**
     * 与分数相乘，向上取整
     *
     * @param z
     */
    multiplyCeilFraction(x, y) {
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
    compareFraction(fraction1, fraction2) {
        const frac1Numerator = formatParam(fraction1.numerator);
        const frac1Denominator = formatParam(fraction1.denominator);
        const frac2Numerator = formatParam(fraction2.numerator);
        const frac2Denominator = formatParam(fraction2.denominator);
        const frac1 = frac1Numerator * frac2Denominator;
        const frac2 = frac2Numerator * frac1Denominator;
        return frac1 === frac2 ? 0 : frac1 > frac2 ? 1 : -1;
    }
};
JSBIHelper = __decorate([
    util_1.Injectable()
], JSBIHelper);
exports.JSBIHelper = JSBIHelper;
//# sourceMappingURL=jsbiHelper.js.map
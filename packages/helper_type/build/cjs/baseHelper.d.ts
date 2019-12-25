/// <reference lib="dom" />
import { IpHelper } from "@bfchain/util";
import { AccountBaseHelper } from "@bfchain/core-helper-account";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
export declare class BaseHelper {
    private accountHelper;
    private configHelper;
    private ipHelper;
    constructor(accountHelper: AccountBaseHelper, configHelper: ConfigHelper, ipHelper: IpHelper);
    isIp(ip: string): boolean;
    isIpV4(ipV4: string): boolean;
    isIpV6(ipV6: string): boolean;
    /**
     * 是否是合法的域名解析值
     *
     * @param record
     */
    isValidLocationNameRecord(record: BFChainCore.LocationNameRecordJSON): boolean;
    /**
     * 接收范围是否合法
     *
     * @param range
     */
    isValidRange(rangeType: RANGE_TYPE, range: string[]): boolean;
    /**
     * 密码公钥是否合法
     *
     * @param cipherPublicKeys
     */
    isValidCipherPublicKeys(cipherPublicKeys: string[]): boolean;
    /**
     * 是否是一个合法的账号签名
     *
     * @param accountSignature
     */
    isValidAccountSignature(accountSignature: BFChainCore.AccountSignatureJSON | undefined): boolean;
    /**
     * 第三方签名是否合法
     *
     * @param thirdPartySignatures
     */
    isValidThirdPartySignatures(thirdPartySignatures: any): boolean;
    /**
     * 获取输入值的类型
     *
     * @param variable
     */
    getVariableType(variable: any): string;
    /**
     * 判断是否是一个 boolean 值
     *
     * @param value
     */
    isBoolean(value: any): value is boolean;
    /**
     * 判断输入值是否是非负整数
     *
     * @param value
     */
    isNaturalNumber(value: any): value is number;
    /**uint32的最大数值 */
    MAX_UINT_32_INTEGER: number;
    /**判断输入值是否是合法的uint32数值 */
    isUint32(value: any): value is number;
    /**判读是否是非空的`Uint8Array` */
    isNoEmptyUint8Array(value: any): value is Uint8Array;
    /**
     * 判断输入值是否是正整数
     *
     * @param value
     */
    isPositiveInteger(value: any): value is number;
    /**
     * 判断输入值是否是满足条件
     *
     * @param value
     */
    isPositiveFloatMatchCondition<R extends boolean, T = any>(value: T, condition: (value: number) => R): false | R;
    /**
     * 判断输入值是否是非负浮点数，包含 0
     *
     * @param value
     */
    isPositiveFloatContainZero(value: unknown): value is number;
    /**
     * 判断输入值是否是正浮点数，不包含 0
     *
     * @param value
     */
    isPositiveFloatNotContainZero(value: unknown): value is number;
    /**
     * 判断输入数据是否是一个分数
     *
     * @param value
     */
    isFraction(value: any): value is BFChainCore.FractionJSON;
    /**
     * 判断输入数据是否是一个可作为BigInt的值
     * @param value
     */
    isFiniteBigInt(value: unknown): value is number | bigint | string;
    /**
     * 判断是否为空对象
     * @param {*} e
     */
    isEmptyObject(e: unknown): e is object;
    /**
     * 快速判断两个数组是否相等
     * @param a
     * @param b
     */
    isArrayEqual<T>(a: ArrayLike<T>, b: ArrayLike<T>): boolean;
    /**hex字符串或者buffer长度是否合法 */
    isValidBufferSize(buffer_or_string: unknown, buffer_length: number): boolean;
    /**
     * 判断公钥是否合法
     *
     */
    isValidPublicKey(publicKey: unknown): boolean;
    /**
     * 判断公钥是否合法
     *
     */
    isValidSecondPublicKey: (publicKey: unknown) => boolean;
    /**
     * 判断公钥是否合法
     *
     */
    isValidSecretKey(secretKey: unknown): boolean;
    /**
     * 是否是一个字符串
     *
     * @param str
     */
    isString(str: unknown): str is string;
    /**
     * 是否是一个数组
     *
     * @param arr
     */
    isArray(arr: unknown): arr is Array<any>;
    /**
     * 是否是一个对象
     *
     * @param obj
     */
    isObject(obj: unknown): obj is Object;
    /**
     * 是否是一个合法的图片格式
     * @FIXME
     * @param img
     */
    isImage(img: unknown): boolean;
    /**
     * 是否是一个合法的URL
     * @param url
     */
    isURL(url: unknown): url is string;
    /**
     * 交易类型是否合法
     *
     * @param type
     */
    isValidTransactionType(type: string): boolean;
    /**
     * 交易 ID 是否合法
     *
     * @param id
     */
    isValidTransactionId(id: string): boolean;
    /**
     * 区块 ID 是否合法
     *
     * @param id
     */
    isValidBlockId(id: string): boolean;
    /**
     * 签名是否合法
     *
     * @param signature
     */
    isValidSignature(signature: any): boolean;
    /**
     * remark.hash 是否合法
     *
     * @param hash
     */
    isValidRemarkHash(hash: any): boolean;
    /**
     * 大写链名
     *
     * @param chainName
     */
    isValidUpperChainName(chainName: string): boolean;
    /**
     * 链名是否合法：小写字母 3-8
     *
     * @param chainName
     */
    isValidChainName(chainName: string): boolean;
    /**
     * 链资产名是否合法：大写字母 3-5
     *
     * @param assetType
     */
    isValidAssetType(assetType: string): boolean;
    /**
     * 链网络标识符是否合法：大写字母、数字 9-16
     *
     * @param magic
     */
    isValidChainMagic(magic: string): boolean;
    /**
     * dappid 是否合法：大写字母、数字 17-32
     *
     * @param dappid
     */
    isValidDAppId(dappid: string): boolean;
    /**
     * 用户名是否合法：
     * 不能包含 ifmchain/bfchain
     * 只能由大小写字母、数字、下划线 1-20
     *
     * @param username
     */
    isValidUsername(username: string): boolean;
    /**
     * 是否是合法的创世受托人名
     *
     * @param username
     */
    isValidGenesisUsername(username: any): boolean;
    /**
     * 是否时是数字组成的字符串
     *
     * @param stringNumber
     */
    isValidStringNumber(stringNumber: any): boolean;
    /**
     * 资产数量是否合法： 只能是数字组成的字符串
     *
     * @param assetNumber
     */
    isValidAssetNumber(assetNumber: any): boolean;
    /**
     * 权益数量是否合法： 只能是数字组成的字符串
     *
     * @param equity
     */
    isValidAccountEquity(equity: any): boolean;
    /**
     * 区块的参与度是否合法： 只能是数字组成的字符串
     *
     * @param blockParticipation
     */
    isValidBlockParticipation(blockParticipation: any): boolean;
    /**
     * 权益比例是否合法： 只能是数字组成的字符串
     *
     * @param equity
     */
    isValidEquityRate(rate: any): boolean;
    /**
     * 链域名是否合法
     * 总域名最大长度 1024
     * 不能以 . 开头或结尾
     * 只能包含大小写字母、数字、.
     * 顶级域名只能是小写字母，多级域名每级只能是大小写字母、数字
     * 每级域名的最大长度 128
     *
     * @param name
     */
    isValidLnsName(name: string, chainName?: string): boolean;
    /**
     * 端口号是否合法
     *
     * @param port
     */
    isValidPort(port: any): port is number;
    /**
     * 链端口号是否合法
     * 不能是空对象
     * 必须包含默认端口和节点扫描端口
     * 端口号 大于 0 小于 65536
     *
     * @param ports
     */
    isValidChainPorts(ports: any): boolean;
    /**
     * 奖励比例是否合法
     * 不能是空对象
     * 必须要有投票奖励比例和打块奖励比例
     * 比例之和必须等于 1
     *
     * @param rewardPercent
     */
    isValidChainRewardPercent(rewardPercent: any): boolean;
    /**
     * 链奖励里程是否合法
     * 不能是空对象
     * 必须包含里程高度数组和里程奖励数组
     * 里程高度数组中每个值只能是数字，并且下一个里程高度大于上一个里程高度
     * 里程奖励数组中每个值只能是字符串，并且是一个合法的资产数量
     * 里程奖励数组长度和里程高度数组长度相差 1
     *
     * @param milestones
     */
    isValidChainRewardMilestones(milestones: any): milestones is BFChainCore.RewardPerBlockJSON;
    /**
     * 是否是纯大写
     *
     * @param value
     */
    isUpperCaseString(value: any): value is string;
    /**
     * 是否是纯小写
     *
     * @param value
     */
    isLowerCaseString(value: any): value is string;
    /**
     * 是否是科学计数法
     *
     * @param value
     */
    isScientificCounting(value: string): boolean;
    /**
     * 是否时纯小写字母
     *
     * @param value
     */
    isLowerCaseLetters(value: string): boolean;
    /**
     * 是否是大写字母或数字
     *
     * @param value
     */
    isUpperCaseOrNumber(value: string): boolean;
    /**
     * 是否是纯大小写字母
     *
     * @param value
     */
    isUpperCaseOrLowerCase(value: string): boolean;
    /**
     * 是否是大小写字母或数字
     *
     * @param value
     */
    isUpperCaseOrLowerCaseOrNumber(value: string): boolean;
    /**
     * 是否以点开头或结尾
     *
     * @param value
     */
    isStartWithOrEndWithPoint(value: string): boolean;
    /**
     * 字母开头，内容可包含数字
     *
     * @param value
     */
    isLowerCaseOrNumberOrUnderline(value: string): boolean;
    /**
     * 手续费比例是否合法
     *
     * @param feeRate
     */
    isValidFeeRate(feeRate: BFChainCore.FeeRateJSON): boolean;
    private BI_2_32;
    private BI_2_16;
    private BI_2_8;
    /**读取一个二进制的n位数据作为BigInt数字 */
    getUintX(dv: BFChainUtil.Buffer, X: number): bigint;
    /**
     * 兑换比例是否合法
     *
     * @param rate
     */
    isValidRate(rate: BFChainCore.RateJSON<any>): boolean;
}
//# sourceMappingURL=baseHelper.d.ts.map
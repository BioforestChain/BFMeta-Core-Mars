import { Message } from "@bfchain/protobuf";
import { TransactionInBlock } from "@bfchain/core-model-transaction";
import { StatisticInfoModel } from "./statistic_info";
export declare type GetBlockRemarkModel<T extends Block> = T["REMARK_MODEL_TYPE"];
export declare type GetBlockRemarkJSON<T extends Block> = T["REMARK_JSON_TYPE"];
export declare class Block<RJ extends BFChainCore.CommonBlockRemarkJSON = BFChainCore.CommonBlockRemarkJSON> extends Message<Block<RJ>> implements BFChainCore.BlockJSON<RJ> {
    REMARK_MODEL_TYPE: BFChainCore.RemarkJSONToModelType<RJ>;
    REMARK_JSON_TYPE: RJ;
    remark: BFChainCore.RemarkJSONToModelType<RJ>;
    version: number;
    /**
     * 1. 区块高度
     * 这里高度必须放在第一位，这样一个二进制数据才能快速读取出其高度，才知道对应的解析Model
     */
    height: number;
    /**
     * 2. 区块ID
     * 同理`height`，`id`放在第二位
     */
    get id(): string;
    /**
     * 2. 交易的发起者签名
     */
    blockSignatureBuffer: Uint8Array;
    get blockSignature(): string;
    set blockSignature(value: string);
    /**
     * 3. 锻造时间戳
     */
    timestamp: number;
    /**
     * 4. 锻造公钥
     */
    generatorPublicKeyBuffer: Uint8Array;
    get generatorPublicKey(): string;
    set generatorPublicKey(value: string);
    /**
     * 5. 前块 id
     */
    previousBlock: string;
    /**
     * 6. 区块交易量
     */
    numberOfTransactions: number;
    /**
     * 7. 区块所属的链网络标识符
     */
    magic: string;
    static INC: number;
    /**区块大小 */
    blockSize: number;
    /**交易 hash */
    payloadHashBuffer: Uint8Array;
    get payloadHash(): string;
    set payloadHash(value: string);
    /**交易 hash 长度 */
    payloadLength: number;
    /**区块统计信息 */
    statisticInfo: StatisticInfoModel;
    /**区块总资产数量 */
    get totalAmount(): string;
    /**区块总手续费 */
    get totalFee(): string;
    /**区块奖励 */
    reward: string;
    /**区块交易 */
    transactionBufferList: Uint8Array[];
    get transactions(): TransactionInBlock[];
    set transactions(trsList: TransactionInBlock[]);
    getBytes(skipSignature?: boolean, skipTransactions?: boolean): Uint8Array;
    toJSON(): {
        version: number;
        id: string;
        height: number;
        blockSize: number;
        timestamp: number;
        blockSignature: string;
        generatorPublicKey: string;
        numberOfTransactions: number;
        payloadHash: string;
        payloadLength: number;
        previousBlock: string;
        totalAmount: string;
        totalFee: string;
        reward: string;
        magic: string;
        transactions: ({
            index: number;
            height: number;
            transactionAssetChanges: {
                accountType: import("@bfchain/core-model-transaction").TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
                assetTypes: number;
                assetBalance: string;
            }[];
            signature: string;
        } & {
            transaction: BFChainCore.TransactionJSON<object>;
        })[];
        remark: RJ;
        statisticInfo: {
            totalFee: string;
            totalAsset: string;
            totalChainAsset: string;
            totalAccount: number;
            assetStatisticHashMap: {
                [x: number]: import("./statistic_info").AssetStatisticModel;
            };
        };
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<BFChainCore.BlockJSON<BFChainCore.GetRemarkModel<T>>>): T;
}
//# sourceMappingURL=block.d.ts.map
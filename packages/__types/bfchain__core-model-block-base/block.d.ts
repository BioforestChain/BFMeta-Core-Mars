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
    height: number;
    signatureBuffer: Uint8Array;
    get signature(): string;
    set signature(value: string);
    timestamp: number;
    generatorPublicKeyBuffer: Uint8Array;
    get generatorPublicKey(): string;
    set generatorPublicKey(value: string);
    previousBlockSignature: string;
    numberOfTransactions: number;
    magic: string;
    static INC: number;
    blockSize: number;
    payloadHashBuffer: Uint8Array;
    get payloadHash(): string;
    set payloadHash(value: string);
    payloadLength: number;
    statisticInfo: StatisticInfoModel;
    get totalAmount(): string;
    get totalFee(): string;
    reward: string;
    transactionBufferList: Uint8Array[];
    get transactions(): TransactionInBlock[];
    set transactions(trsList: TransactionInBlock[]);
    getBytes(skipSignature?: boolean, skipTransactions?: boolean): Uint8Array;
    toJSON(): {
        version: number;
        height: number;
        blockSize: number;
        timestamp: number;
        signature: string;
        generatorPublicKey: string;
        numberOfTransactions: number;
        payloadHash: string;
        payloadLength: number;
        previousBlockSignature: string;
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
            transaction: any;
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

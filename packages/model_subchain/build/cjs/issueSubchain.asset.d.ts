/// <reference types="long" />
import { Message } from "@bfchain/protobuf";
import { RewardPercentModel, PortsModel, RewardPerBlock, TransactionPowOfWorkConfigModel } from "@bfchain/core-model-block-remark";
import { Fraction } from "@bfchain/core-model-common";
/**
 * issueSubchain 交易 asset 模型
 *
 */
export declare class IssueSubchainModel extends Message<IssueSubchainModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueSubchainJSON> {
    /**子链名称 */
    chainName: string;
    /**子链名称缩写 */
    assetType: string;
    /**子链网络标识符 */
    magic: string;
    /**区块链网络识别码 */
    bnid: string;
    /**子链的创世时间 */
    beginEpochTimeLong: Long;
    get beginEpochTime(): number;
    set beginEpochTime(v: number);
    /**创世节点地址 */
    genesisNodeAddress: string;
    /**创世账户初始余额 */
    generateTotalAmount: string;
    /**交易每个字节最小的手续费 */
    minTransactionFeePerByte: Fraction;
    /**区块最大长度 */
    maxPayloadLength: number;
    /**区块最大 tps */
    maxTPSPerBlock: number;
    /**最大交易长度 */
    maxTransactionSize: number;
    /**最大区块 remark 长度 */
    maxBlockRemarkSize: number;
    /**区块不同数量大于某个值时同步前需要先共识的 */
    consessusBeforeSyncBlockDiff: number;
    /**每轮可处理的受托人交易数量 */
    maxDelegateTxsPerRound: number;
    /**发行资产最小的持有本链资产数量 */
    issueAssetMinChainAsset: string;
    /**发行子链最小的持有本链资产数量 */
    issueSubchainMinChainAsset: string;
    /**链资产和数字资产的兑换比例 */
    chainAssetAndDigitalAssetExchangeRate: number;
    /**链资产和子链资产的兑换比例 */
    chainAssetAndSubchainAssetExchangeRate: number;
    /**链资产的奖励权重 */
    chainAssetRewardWeight: number;
    /**交易量的奖励权重 */
    numberOfTransactionRewardWeight: number;
    /**交易的发起高度和确认高度最大的区块高度间隔 */
    maxApplyAndConfirmedBlockHeightDiff: number;
    /**前 n 个块 交易 pow 豁免 */
    powOfWorkExemptionBlocks: number;
    /**每轮的区块数量 */
    blockPerRound: number;
    /**创世受托人数量 */
    delegates: number;
    /**区块时间间隔 */
    forgeInterval: number;
    /**奖励比例 */
    rewardPercent: RewardPercentModel;
    /**端口号 */
    ports: PortsModel;
    /**奖励里程 */
    rewardPerBlock: RewardPerBlock;
    /**参与度 流通的链资产总量 的 计算比重 */
    participationTotalChainAsset: number;
    /**参与度 总交易量 的 计算比重 */
    participationNumberOfTransaction: number;
    /**参与度 参与的账户总数 的 计算比重 */
    participationNumberOfAccount: number;
    /**参与度 总手续费 的 计算比重 */
    participationTotalFee: number;
    transactionPowOfWorkConfig: TransactionPowOfWorkConfigModel;
    /**创世块 */
    genesisBlock: import("@bfchain/core-model-block").GenesisBlock;
    toJSON(): {
        chainName: string;
        assetType: string;
        magic: string;
        bnid: string;
        beginEpochTime: number;
        genesisNodeAddress: string;
        generateTotalAmount: string;
        minTransactionFeePerByte: {
            numerator: number;
            denominator: number;
        };
        maxPayloadLength: number;
        maxTPSPerBlock: number;
        maxTransactionSize: number;
        maxBlockRemarkSize: number;
        consessusBeforeSyncBlockDiff: number;
        maxDelegateTxsPerRound: number;
        issueAssetMinChainAsset: string;
        issueSubchainMinChainAsset: string;
        chainAssetAndDigitalAssetExchangeRate: number;
        chainAssetAndSubchainAssetExchangeRate: number;
        chainAssetRewardWeight: number;
        numberOfTransactionRewardWeight: number;
        maxApplyAndConfirmedBlockHeightDiff: number;
        powOfWorkExemptionBlocks: number;
        blockPerRound: number;
        delegates: number;
        forgeInterval: number;
        rewardPercent: {
            votePercent: {
                numerator: number;
                denominator: number;
            };
            forgePercent: {
                numerator: number;
                denominator: number;
            };
        };
        ports: {
            port: number;
            scan_peer_port: number;
        };
        rewardPerBlock: {
            heights: number[];
            rewards: string[];
        };
        participationTotalChainAsset: number;
        participationNumberOfTransaction: number;
        participationNumberOfAccount: number;
        participationTotalFee: number;
        transactionPowOfWorkConfig: {
            growthFactor: {
                numerator: string;
                denominator: string;
            };
            participationRatio: {
                numerator: number;
                denominator: number;
            };
        };
        genesisBlock: {
            version: number;
            id: string;
            height: number;
            blockSize: number;
            timestamp: number;
            blockSignature: string;
            generatorPublicKey: string; /**发行子链最小的持有本链资产数量 */
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
                signature: string; /**交易的发起高度和确认高度最大的区块高度间隔 */
            } & {
                transaction: BFChainCore.TransactionJSON<object>;
            })[];
            remark: BFChainCore.GenesisBlockRemarkJSON;
            statisticInfo: {
                totalFee: string;
                totalAsset: string;
                totalChainAsset: string;
                totalAccount: number;
                assetStatisticHashMap: {
                    [x: number]: import("@bfchain/core-model-block").AssetStatisticModel;
                };
            };
        };
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<IssueSubchainModel>): T;
}
/**
 * issueSubchain 交易 asset 外层模型
 *
 */
export declare class IssueSubchainAssetModel extends Message<IssueSubchainAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueSubchainAssetJSON> {
    issueSubchain: IssueSubchainModel;
    toJSON(): {
        issueSubchain: {
            chainName: string;
            assetType: string;
            magic: string;
            bnid: string;
            beginEpochTime: number;
            genesisNodeAddress: string;
            generateTotalAmount: string;
            minTransactionFeePerByte: {
                numerator: number;
                denominator: number;
            };
            maxPayloadLength: number;
            maxTPSPerBlock: number;
            maxTransactionSize: number;
            maxBlockRemarkSize: number;
            consessusBeforeSyncBlockDiff: number;
            maxDelegateTxsPerRound: number;
            issueAssetMinChainAsset: string;
            issueSubchainMinChainAsset: string;
            chainAssetAndDigitalAssetExchangeRate: number;
            chainAssetAndSubchainAssetExchangeRate: number;
            chainAssetRewardWeight: number;
            numberOfTransactionRewardWeight: number;
            maxApplyAndConfirmedBlockHeightDiff: number;
            powOfWorkExemptionBlocks: number;
            blockPerRound: number;
            delegates: number;
            forgeInterval: number;
            rewardPercent: {
                votePercent: {
                    numerator: number;
                    denominator: number;
                };
                forgePercent: {
                    numerator: number;
                    denominator: number;
                };
            };
            ports: {
                port: number;
                scan_peer_port: number;
            };
            rewardPerBlock: {
                heights: number[];
                rewards: string[];
            };
            participationTotalChainAsset: number;
            participationNumberOfTransaction: number;
            participationNumberOfAccount: number;
            participationTotalFee: number;
            transactionPowOfWorkConfig: {
                growthFactor: {
                    numerator: string;
                    denominator: string;
                };
                participationRatio: {
                    numerator: number;
                    denominator: number;
                };
            };
            genesisBlock: {
                version: number;
                id: string;
                height: number;
                blockSize: number;
                timestamp: number;
                blockSignature: string;
                generatorPublicKey: string; /**发行子链最小的持有本链资产数量 */
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
                    signature: string; /**交易的发起高度和确认高度最大的区块高度间隔 */
                } & {
                    transaction: BFChainCore.TransactionJSON<object>;
                })[];
                remark: BFChainCore.GenesisBlockRemarkJSON;
                statisticInfo: {
                    totalFee: string;
                    totalAsset: string;
                    totalChainAsset: string;
                    totalAccount: number;
                    assetStatisticHashMap: {
                        [x: number]: import("@bfchain/core-model-block").AssetStatisticModel;
                    };
                };
            };
        };
    };
}
//# sourceMappingURL=issueSubchain.asset.d.ts.map
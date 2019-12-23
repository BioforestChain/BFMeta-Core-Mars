/// <reference types="long" />
import { Message } from "@bfchain/protobuf";
import { Fraction, FractionBigIntModel } from "@bfchain/core-model-common";
import { RoundDelegateRemarkModel } from "./roundDelegateRemark";
/**
 * RewardPercent 模型
 *
 */
export declare class RewardPercentModel extends Message<RewardPercentModel> implements BFChainCore.JSONToModelType<BFChainCore.RewardPercentJSON> {
    /**分配给投票账户的奖励占区块总奖励的比例 */
    votePercent: Fraction;
    /**分配给打块账户的奖励占区块总奖励的比例 */
    forgePercent: Fraction;
    toJSON(): {
        votePercent: {
            numerator: number;
            denominator: number;
        };
        forgePercent: {
            numerator: number;
            denominator: number;
        };
    };
}
/**
 * Rewards 模型
 *
 */
export declare class RewardPerBlock extends Message<RewardPerBlock> implements BFChainCore.JSONToModelType<BFChainCore.RewardPerBlockJSON> {
    /**奖励变更区块高度 */
    heights: number[];
    /**每阶段奖励资产数量 */
    rewards: string[];
    toJSON(): {
        heights: number[];
        rewards: string[];
    };
}
/**
 * ports 模型
 *
 */
export declare class PortsModel extends Message<PortsModel> implements BFChainCore.JSONToModelType<BFChainCore.PortsJSON> {
    /**默认端口号/区块链端口号 */
    port: number;
    /**节点扫描端口 */
    scan_peer_port: number;
    toJSON(): {
        port: number;
        scan_peer_port: number;
    };
}
export declare class TransactionPowOfWorkConfigModel extends Message<TransactionPowOfWorkConfigModel> implements BFChainCore.JSONToModelType<BFChainCore.TransactionPowOfWorkConfigJSON> {
    growthFactor: FractionBigIntModel;
    participationRatio: Fraction;
    toJSON(): {
        growthFactor: {
            numerator: string;
            denominator: string;
        };
        participationRatio: {
            numerator: number;
            denominator: number;
        };
    };
}
/**
 * GenesisBlockRemark 模型
 *
 */
export declare class GenesisBlockRemarkModel extends RoundDelegateRemarkModel<GenesisBlockRemarkModel> implements BFChainCore.RemarkJSONToModelType<BFChainCore.GenesisBlockRemarkJSON> {
    /**链资产名 */
    assetType: string;
    /**链名 */
    chainName: string;
    /**网络标识符 */
    magic: string;
    /**区块链网络识别码 */
    bnid: string;
    /**链的创世时间 */
    beginEpochTimeLong: Long;
    get beginEpochTime(): number;
    set beginEpochTime(v: number);
    /**创世节点地址 */
    genesisNodeAddress: string;
    /**创始账户初始余额 */
    generateTotalAmount: string;
    /**交易每个字节最小手续费 */
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
    /**父链创世块
     * @TODO FIX Type
     */
    parentGenesisBlock: BFChainCore.JSONToModelType<BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>>;
    /**区块处理信息 */
    debug: string;
    /**备注信息 */
    info: string;
    /**区块参与度 */
    blockParticipation: string;
    /**参与度 流通的链资产总量 的 计算比重 */
    participationTotalChainAsset: number;
    /**参与度 总交易量 的 计算比重 */
    participationNumberOfTransaction: number;
    /**参与度 参与的账户总数 的 计算比重 */
    participationNumberOfAccount: number;
    /**参与度 总手续费 的 计算比重 */
    participationTotalFee: number;
    transactionPowOfWorkConfig: TransactionPowOfWorkConfigModel;
    /**前 n 个块 交易的 pow豁免 */
    powOfWorkExemptionBlocks: number;
    toJSON(): {
        newDelegates: string[];
        maxBeginBalance: string;
        maxTxCount: number;
        nextRoundDelegates: {
            address: string;
            equity: string;
        }[];
        rate: string;
    } & {
        assetType: string;
        chainName: string;
        magic: string;
        bnid: string;
        beginEpochTime: number;
        genesisNodeAddress: string;
        generateTotalAmount: string;
        minTransactionFeePerByte: Fraction;
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
        debug: string;
        info: string;
        blockParticipation: string;
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
        powOfWorkExemptionBlocks: number;
        parentGenesisBlock: BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>;
    };
    getBytes(): Uint8Array;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<GenesisBlockRemarkModel>): T;
}
//# sourceMappingURL=genesisBlockRemark.d.ts.map
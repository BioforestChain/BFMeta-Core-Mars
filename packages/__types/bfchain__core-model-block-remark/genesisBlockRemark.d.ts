/// <reference types="long" />
import { Message } from "@bfchain/protobuf";
import { Fraction, FractionBigIntModel } from "@bfchain/core-model-common";
import { RoundDelegateRemarkModel } from "./roundDelegateRemark";
export declare class RewardPercentModel extends Message<RewardPercentModel> implements BFChainCore.JSONToModelType<BFChainCore.RewardPercentJSON> {
    votePercent: Fraction;
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
export declare class RewardPerBlock extends Message<RewardPerBlock> implements BFChainCore.JSONToModelType<BFChainCore.RewardPerBlockJSON> {
    heights: number[];
    rewards: string[];
    toJSON(): {
        heights: number[];
        rewards: string[];
    };
}
export declare class PortsModel extends Message<PortsModel> implements BFChainCore.JSONToModelType<BFChainCore.PortsJSON> {
    port: number;
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
export declare class GenesisBlockRemarkModel extends RoundDelegateRemarkModel<GenesisBlockRemarkModel> implements BFChainCore.RemarkJSONToModelType<BFChainCore.GenesisBlockRemarkJSON> {
    assetType: string;
    chainName: string;
    magic: string;
    bnid: string;
    beginEpochTimeLong: Long;
    get beginEpochTime(): number;
    set beginEpochTime(v: number);
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
    whetherToAllowDelegateContinusElections: boolean;
    forgeInterval: number;
    rewardPercent: RewardPercentModel;
    ports: PortsModel;
    rewardPerBlock: RewardPerBlock;
    parentGenesisBlock?: BFChainCore.JSONToModelType<BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>>;
    debug: string;
    info: string;
    blockParticipation: string;
    participationTotalChainAsset: number;
    participationNumberOfTransaction: number;
    participationNumberOfAccount: number;
    participationTotalFee: number;
    transactionPowOfWorkConfig: TransactionPowOfWorkConfigModel;
    powOfWorkExemptionBlocks: number;
    toJSON(): BFChainCore.GenesisBlockRemarkJSON;
    getBytes(): Uint8Array;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<GenesisBlockRemarkModel>): T;
}

/// <reference types="long" />
import { Message } from "@bfchain/protobuf";
import { RewardPercentModel, PortsModel, RewardPerBlock, TransactionPowOfWorkConfigModel } from "@bfchain/core-model-block-remark";
import { GenesisBlock } from "@bfchain/core-model-block";
import { Fraction } from "@bfchain/core-model-common";
export declare class IssueSubchainModel extends Message<IssueSubchainModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueSubchainJSON> {
    chainName: string;
    assetType: string;
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
    powOfWorkExemptionBlocks: number;
    blockPerRound: number;
    delegates: number;
    whetherToAllowDelegateContinusElections: boolean;
    forgeInterval: number;
    rewardPercent: RewardPercentModel;
    ports: PortsModel;
    rewardPerBlock: RewardPerBlock;
    participationTotalChainAsset: number;
    participationNumberOfTransaction: number;
    participationNumberOfAccount: number;
    participationTotalFee: number;
    transactionPowOfWorkConfig: TransactionPowOfWorkConfigModel;
    genesisBlock: GenesisBlock;
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
        whetherToAllowDelegateContinusElections: boolean;
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
            whetherToAllowDelegateContinusElections: boolean;
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

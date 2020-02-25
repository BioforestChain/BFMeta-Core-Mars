declare namespace BFChainCore {
    type Block<RJ extends CommonBlockRemarkJSON = CommonBlockRemarkJSON> = import("./block").Block<RJ>;
    type BlockModelConstructor = typeof import("./").Block;
    type GetRemarkModel<T> = T extends BlockJSON<infer U> ? U : any;
    interface BlockWithoutTransactionJSON<RemarkJSON> {
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
        remark: RemarkJSON;
        statisticInfo: StatisticInfoJSON;
    }
    interface BlockJSON<RemarkJSON extends {} = {}> extends BlockWithoutTransactionJSON<RemarkJSON> {
        transactions: TransactionInBlockJSON[];
    }
    interface CountAndAmountStatisticJSON {
        changeAmount: string;
        changeCount: number;
        moveAmount: string;
        transactionCount: number;
    }
    interface AssetStatisticJSON extends AssetInfoJSON {
        index: number;
        typeStatisticHashMap: {
            [baseType: number]: CountAndAmountStatisticJSON;
        };
        total: CountAndAmountStatisticJSON;
    }
    interface StatisticInfoJSON {
        totalFee: string;
        totalAsset: string;
        totalChainAsset: string;
        totalAccount: number;
        assetStatisticHashMap: {
            [index: number]: AssetStatisticJSON;
        };
    }
    type RemarkJSONToModelType<J extends CommonBlockRemarkJSON = CommonBlockRemarkJSON> = JSONToModelType<J> & {
        getBytes(): Uint8Array;
    };
    interface CommonBlockRemarkJSON {
        debug: string;
        info: string;
        blockParticipation: string;
    }
    interface RoundDelegateRemarkJSON {
        nextRoundDelegates: NextRoundDelegateJSON[];
        newDelegates: string[];
        maxBeginBalance: string;
        maxTxCount: number;
        rate: string;
    }
    interface NextRoundDelegateJSON {
        address: string;
        equity: string;
    }
    interface RoundLastBlockRemarkJSON extends RoundDelegateRemarkJSON, CommonBlockRemarkJSON {
        hash: string;
    }
    interface GenesisBlockRemarkJSON extends RoundDelegateRemarkJSON, CommonBlockRemarkJSON {
        assetType: string;
        chainName: string;
        magic: string;
        bnid: string;
        beginEpochTime: number;
        genesisNodeAddress: string;
        generateTotalAmount: string;
        minTransactionFeePerByte: FractionJSON;
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
        rewardPercent: RewardPercentJSON;
        ports: PortsJSON;
        rewardPerBlock: RewardPerBlockJSON;
        parentGenesisBlock?: BlockJSON<GenesisBlockRemarkJSON>;
        blockParticipation: string;
        participationTotalChainAsset: number;
        participationNumberOfTransaction: number;
        participationNumberOfAccount: number;
        participationTotalFee: number;
        transactionPowOfWorkConfig: TransactionPowOfWorkConfigJSON;
    }
    interface RewardPercentJSON {
        votePercent: FractionJSON;
        forgePercent: FractionJSON;
    }
    interface PortsJSON {
        port: number;
        scan_peer_port: number;
    }
    interface RewardPerBlockJSON {
        readonly heights: number[];
        readonly rewards: string[];
    }
    interface ParentInfoJSON {
        magic: string;
        chainName: string;
        assetType: string;
        genesisNodeAddress: string;
    }
    interface TransactionPowOfWorkConfigJSON {
        growthFactor: FractionJSON<string>;
        participationRatio: FractionJSON;
    }
}

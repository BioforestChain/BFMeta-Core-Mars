declare namespace BFChainCore {
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
        forgeInterval: number;
        rewardPercent: RewardPercentJSON;
        ports: PortsJSON;
        rewardPerBlock: RewardPerBlockJSON;
        /**
         * @FIXME @WMC
         */
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
//# sourceMappingURL=@types.d.ts.map
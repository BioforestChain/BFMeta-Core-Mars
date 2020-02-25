declare namespace BFChainCore {
    interface IssueSubchainJSON {
        chainName: string;
        assetType: string;
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
        participationTotalChainAsset: number;
        participationNumberOfTransaction: number;
        participationNumberOfAccount: number;
        participationTotalFee: number;
        transactionPowOfWorkConfig: TransactionPowOfWorkConfigJSON;
        genesisBlock: BlockJSON<GenesisBlockRemarkJSON>;
    }
    interface IssueSubchainAssetJSON {
        issueSubchain: IssueSubchainJSON;
    }
    type IssueSubchainTransactionJSON = TransactionMixJSON<IssueSubchainAssetJSON, {
        hasRecipientId: false;
    }>;
}

declare namespace BFChainCore {
    interface ApplyTransactionEvent<ApplyInfo, EVENTNAME, T extends Transaction = Transaction> {
        type: string;
        transaction: T;
        applyInfo: ApplyInfo;
    }
    interface ApplyTransactionFlowEvent<EVENTNAME, T extends Transaction = Transaction> extends ApplyTransactionEvent<undefined, EVENTNAME, T> {
    }
    type ApplyInfo_Asset = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        assetInfo: AssetInfoJSON;
        amount: string;
        sourceAmount: string;
    };
    type ApplyTransactionAssetEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_Asset, EVENTNAME, T>;
    interface ApplyInfo_FeeFromUnfrozenAsset extends ApplyInfo_Asset {
        frozenIdBuffer: Uint8Array;
    }
    type ApplyTransactionFeeEvent<EVENTNAME extends "fee" | "feeFromUnfrozen" = "fee", T extends Transaction = Transaction> = EVENTNAME extends "fee" ? ApplyTransactionEvent<ApplyInfo_Asset, "fee", T> : ApplyTransactionEvent<ApplyInfo_FeeFromUnfrozenAsset, "feeFromUnfrozen", T>;
    interface ApplyInfo_FrozenAsset extends ApplyInfo_Asset {
        frozenIdBuffer: Uint8Array;
        minEffectiveHeight: number;
        maxEffectiveHeight: number;
        totalUnfrozenTimes?: number;
    }
    type ApplyTransactionFrozenAssetEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_FrozenAsset, EVENTNAME, T>;
    interface ApplyInfo_UnfrozenAsset extends ApplyInfo_Asset {
        frozenIdBuffer: Uint8Array;
        recipientId: string;
    }
    type ApplyTransactionUnfrozenAssetEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_UnfrozenAsset, EVENTNAME, T>;
    type ApplyInfo_Account = {
        address: string;
        publicKeyBuffer: Uint8Array;
    };
    type ApplyTransactionAccountEvent<EVENTNAME, T extends Transaction> = ApplyTransactionEvent<ApplyInfo_Account, EVENTNAME, T>;
    type ApplyInfo_Equity = {
        address: string;
        publicKeyBuffer: Uint8Array;
        equity: string;
        sourceEquity: string;
        recipientId: string;
    };
    type ApplyTransactionEquityEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_Equity, EVENTNAME, T>;
    type ApplyInfo_Username = {
        address: string;
        publicKeyBuffer: Uint8Array;
        alias: string;
    };
    type ApplyTransactionUsernameEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_Username, EVENTNAME, T>;
    type ApplyInfo_Signature = {
        address: string;
        publicKeyBuffer: Uint8Array;
        secondPublicKeyBuffer: Uint8Array;
    };
    type ApplyTransactionSignatureEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_Signature, EVENTNAME, T>;
    type ACCOUNT_STATUS = import("@bfchain/core-model-constants").ACCOUNT_STATUS;
    type ApplyInfo_FrozenAccount = {
        address: string;
        publicKeyBuffer: Uint8Array;
        accountStatus: ACCOUNT_STATUS;
    };
    type ApplyTransactionFrozenAccountEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_FrozenAccount, EVENTNAME, T>;
    type ApplyInfo_IssueDAppid = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        sourceChainName: string;
        sourceChainMagic: string;
        dappid: string;
        possessorAddress: string;
        type: DAPP_TYPE;
        purchaseAsset?: DAppPurchaseAssetJSON;
    };
    type ApplyTransactionIssueDAppidEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_IssueDAppid, EVENTNAME, T>;
    type ApplyInfo_SaleDAppid = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        dappid: string;
        sourceChainMagic: string;
        minEffectiveHeight: number;
        maxEffectiveHeight: number;
    };
    type ApplyTransactionSaleDAppidEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_SaleDAppid, EVENTNAME, T>;
    type ApplyInfo_PurchaseDAppid = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        possessorAddress: string;
        dappid: string;
        sourceChainMagic: string;
    };
    type ApplyTransactionPurchaseDAppidEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_PurchaseDAppid, EVENTNAME, T>;
    type ApplyInfo_IssueAsset = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        applyAddress: string;
        sourceChainName: string;
        sourceChainMagic: string;
        assetType: string;
        genesisAddress: string;
        expectedIssuedAssets: string;
        remainAssets: string;
    };
    type ApplyTransactionIssueAssetEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_IssueAsset, EVENTNAME, T>;
    type ApplyInfo_IssueSubchain = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        chainName: string;
        assetType: string;
        magic: string;
        bnid: string;
        maxTPSPerBlock: number;
        blockPerRound: number;
        delegates: number;
        genesisBlock: import("@bfchain/core-model-block").GenesisBlock;
    };
    type ApplyTransactionIssueSubchainEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_IssueSubchain, EVENTNAME, T>;
    type ApplyInfo_LocationNameRegistration = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        name: string;
        sourceChainName: string;
        sourceChainMagic: string;
    };
    type ApplyTransactionRegisterLocationNameEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_LocationNameRegistration, EVENTNAME, T>;
    type ApplyInfo_LocationNameCancellation = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        name: string;
        sourceChainMagic: string;
    };
    type ApplyTransactionCancelLocationNameEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_LocationNameCancellation, EVENTNAME, T>;
    type ApplyInfo_SetLnsManager = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        name: string;
        sourceChainMagic: string;
        manager: string;
    };
    type ApplyTransactionSetLnsManagerEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_SetLnsManager, EVENTNAME, T>;
    type ApplyInfo_SetLnsRecordValue = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        name: string;
        sourceChainMagic: string;
        operationType: RECORD_OPERATION_TYPE;
        addRecord?: LocationNameRecordJSON;
        deleteRecord?: LocationNameRecordJSON;
    };
    type ApplyTransactionSetLnsRecordValueEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_SetLnsRecordValue, EVENTNAME, T>;
    type ApplyInfo_SaleLocationName = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        name: string;
        sourceChainMagic: string;
        minEffectiveHeight: number;
        maxEffectiveHeight: number;
    };
    type ApplyTransactionSaleLocationNameEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_SaleLocationName, EVENTNAME, T>;
    type ApplyInfo_PurchaseLocationName = {
        address: string;
        publicKeyBuffer?: Uint8Array;
        possessorAddress: string;
        name: string;
        sourceChainMagic: string;
    };
    type ApplyTransactionPurchaseLocationNameEvent<EVENTNAME, T extends Transaction = Transaction> = ApplyTransactionEvent<ApplyInfo_PurchaseLocationName, EVENTNAME, T>;
    type ApplyTransactionEventMap<EM extends BFChainUtil.EventInOutMap = {}> = EM & {
        verifyTransactionProfOfWork: BFChainUtil.EventInOut<{
            transaction: Transaction;
            count: number;
        }, boolean>;
        beginDealTransaction: BFChainUtil.EventInOut<ApplyTransactionFlowEvent<"beginDealTransaction">>;
        fee: BFChainUtil.EventInOut<ApplyTransactionFeeEvent<"fee", Transaction>, void>;
        feeFromUnfrozen: BFChainUtil.EventInOut<ApplyTransactionFeeEvent<"feeFromUnfrozen">>;
        asset: BFChainUtil.EventInOut<ApplyTransactionAssetEvent<"asset">>;
        voteEquity: BFChainUtil.EventInOut<ApplyTransactionEquityEvent<"voteEquity", import("@bfchain/core-model-transaction").VoteTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        registerToDelegate: BFChainUtil.EventInOut<ApplyTransactionAccountEvent<"delegate", import("@bfchain/core-model-transaction").DelegateTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        setUsername: BFChainUtil.EventInOut<ApplyTransactionUsernameEvent<"username", import("@bfchain/core-model-transaction").UsernameTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        setSecondPublicKey: BFChainUtil.EventInOut<ApplyTransactionSignatureEvent<"secondPublicKey", import("@bfchain/core-model-transaction").SignatureTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        acceptVote: BFChainUtil.EventInOut<ApplyTransactionAccountEvent<"acceptVote", import("@bfchain/core-model-transaction").AcceptVoteTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        rejectVote: BFChainUtil.EventInOut<ApplyTransactionAccountEvent<"rejectVote", import("@bfchain/core-model-transaction").RejectVoteTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        destoryAsset: BFChainUtil.EventInOut<ApplyTransactionAssetEvent<"destoryAsset", import("@bfchain/core-model-transaction").DestoryAssetTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        frozenAccount: BFChainUtil.EventInOut<ApplyTransactionFrozenAccountEvent<"frozenAccount", import("@bfchain/core-model-transaction").IssueAssetTransaction | import("@bfchain/core-model-subchain").IssueSubchainTransaction | import("@bfchain/core-model-transaction").EmigrateAssetTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        frozenAsset: BFChainUtil.EventInOut<ApplyTransactionFrozenAssetEvent<"frozenAsset", import("@bfchain/core-model-transaction").ToExchangeAssetTransaction | import("@bfchain/core-model-transaction").GiftAssetTransaction | import("@bfchain/core-model-transaction").TrustAssetTransaction | import("@bfchain/core-model-transaction").SignForAssetTransaction | import("@bfchain/core-model-transaction").ToExchangeSpecialAssetTransaction | import("@bfchain/core-model-transaction").BeExchangeSpecialAssetTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        unfrozenAsset: BFChainUtil.EventInOut<ApplyTransactionUnfrozenAssetEvent<"unfrozenAsset", import("@bfchain/core-model-transaction").BeExchangeAssetTransaction | import("@bfchain/core-model-transaction").GrabAssetTransaction | import("@bfchain/core-model-transaction").TrustAssetTransaction | import("@bfchain/core-model-transaction").SignForAssetTransaction | import("@bfchain/core-model-transaction").ToExchangeSpecialAssetTransaction | import("@bfchain/core-model-transaction").BeExchangeSpecialAssetTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        issueDAppid: BFChainUtil.EventInOut<ApplyTransactionIssueDAppidEvent<"issueDAppid", import("@bfchain/core-model-transaction").DAppTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        saleDAppid: BFChainUtil.EventInOut<ApplyTransactionSaleDAppidEvent<"saleDAppid", import("@bfchain/core-model-transaction").ToExchangeSpecialAssetTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        purchaseDAppid: BFChainUtil.EventInOut<ApplyTransactionPurchaseDAppidEvent<"purchaseDAppid", import("@bfchain/core-model-transaction").BeExchangeSpecialAssetTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        issueAsset: BFChainUtil.EventInOut<ApplyTransactionIssueAssetEvent<"issueAsset", import("@bfchain/core-model-transaction").IssueAssetTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        issueSubchain: BFChainUtil.EventInOut<ApplyTransactionIssueSubchainEvent<"issueSubchain", import("@bfchain/core-model-subchain").IssueSubchainTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        registerLocationName: BFChainUtil.EventInOut<ApplyTransactionRegisterLocationNameEvent<"registerLocationName", import("@bfchain/core-model-transaction").LocationNameTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        cancelLocationName: BFChainUtil.EventInOut<ApplyTransactionCancelLocationNameEvent<"cancelLocationName", import("@bfchain/core-model-transaction").LocationNameTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        setLnsManager: BFChainUtil.EventInOut<ApplyTransactionSetLnsManagerEvent<"setLnsManager", import("@bfchain/core-model-transaction").SetLnsManagerTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        setLnsRecordValue: BFChainUtil.EventInOut<ApplyTransactionSetLnsRecordValueEvent<"setLnsRecordValue", import("@bfchain/core-model-transaction").SetLnsRecordValueTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        saleLocationName: BFChainUtil.EventInOut<ApplyTransactionSaleLocationNameEvent<"saleLocationName", import("@bfchain/core-model-transaction").ToExchangeSpecialAssetTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        purchaseLocationName: BFChainUtil.EventInOut<ApplyTransactionPurchaseLocationNameEvent<"purchaseLocationName", import("@bfchain/core-model-transaction").BeExchangeSpecialAssetTransaction | import("@bfchain/core-model-transaction").CustomTransaction>>;
        endDealTransaction: BFChainUtil.EventInOut<{
            transactionInBlock: TransactionInBlock;
        }>;
        nearMaxPayloadLength: BFChainUtil.EventInOut<{
            payloadLength: number;
        }>;
        finishedDealTransactions: BFChainUtil.EventInOut<Block>;
        error: BFChainUtil.EventInOut<{
            type: string;
            err: Error | import("@bfchain/util").Exception;
            transactionInBlock: TransactionInBlock;
        }, {
            continue: boolean;
        }>;
    };
    type ApplyTransactionEventEmitter<ES extends BFChainUtil.EventInOutMap = {}> = {
        assetChangesGetter?: (tib: TransactionInBlock) => TransactionInBlock["transactionAssetChanges"];
    } & BFChainUtil.QueneEventEmitter<ApplyTransactionEventMap<ES>>;
    type GenerateBlockEventEmitter<B extends Block = Block, ES extends BFChainUtil.EventInOutMap = {}> = ApplyTransactionEventEmitter<{
        beforeGenerateBlock: BFChainUtil.EventInOut<BFChainCore.BlockBody>;
        beforeSignatureBlock: BFChainUtil.EventInOut<B>;
        generatedBlock: BFChainUtil.EventInOut<B>;
    } & ES>;
}

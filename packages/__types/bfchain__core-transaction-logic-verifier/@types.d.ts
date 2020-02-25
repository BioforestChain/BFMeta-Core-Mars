declare namespace BFChainCore {
    type TransactionLogicVerifier<T extends Transaction> = import("./atom_transactionLogicVerifier/_txbaseLogicVerifier").TransactionLogicVerifier<T>;
    type TransactionLogicVerifierConstructor<T extends Transaction = any> = new (...args: any[]) => TransactionLogicVerifier<T>;
    type AccountInfo = {
        address: string;
        publicKey?: string;
        vote: bigint;
        username?: string;
        secondPublicKey?: string;
        accountStatus: number;
        isDelegate: number;
        isAcceptVote: number;
        equityInfo: {
            round: number;
            equity: bigint;
        };
    };
    type AssetInfo = {
        sourceChainMagic: string;
        assetType: string;
        sourceChainName?: string;
        assetNumber: bigint;
    };
    type AccountAssets = {
        [sourceChainMagic: string]: {
            [assetType: string]: AssetInfo;
        };
    };
    type AccountInfoAndAssets = {
        accountInfo: AccountInfo;
        accountAssets: AccountAssets;
    };
    type DAppInfo = {
        dappid: string;
        possessorAddress: string;
        sourceChainName: string;
        sourceChainMagic: string;
        type: number;
        height: number;
        status: number;
        maxFrozenBlockHeight: number;
        purchaseAsset?: BFChainCore.DAppPurchaseAssetJSON;
    };
    type LocationNameRecordInfo = {
        [recordType: string]: {
            [recordValue: string]: boolean;
        };
    };
    type LocationNameInfo = {
        name: string;
        sourceChainName: string;
        sourceChainMagic: string;
        possessorAddress: string;
        manager: string;
        records: LocationNameRecordInfo;
        level: string;
        height: number;
        status: number;
        maxFrozenBlockHeight: number;
        isDelete?: boolean;
    };
    type FrozenAssetInfo = {
        sourceChainMagic: string;
        assetType: string;
        amount: bigint;
    };
    type IssuedAssetInfo = {
        applyAddress: string;
        genesisAddress: string;
        sourceChainName: string;
        sourceChainMagic: string;
        assetType: string;
        expectedIssuedAssets: bigint;
        originalFrozenAssets: bigint;
        remainAssets: bigint;
        height: number;
    };
    interface FrozenAssetBaseInfo extends FrozenAssetInfo {
        transactionSignature: string;
        address: string;
        minEffectiveHeight: number;
        maxEffectiveHeight: number;
        remainUnfrozenTimes?: number;
    }
    interface FrozenAsset extends FrozenAssetBaseInfo {
        height: number;
    }
    type IssuedSubchainInfo = {
        chainName: string;
        assetType: string;
        magic: string;
        bnid: string;
        maxTPSPerBlock: number;
        blockPerRound: number;
        delegates: number;
        height: number;
    };
    type AccountAccumulationInfo = {
        [address: string]: number;
    };
    type AccountEquityInfo = {
        [delegateAddress: string]: bigint;
    };
    type AccountBaseInfo = {
        productivity: number;
        address: string;
        publicKey: string;
        vote: bigint;
    };
    interface AccountGetterHelperInterface<T extends AccountBaseInfo> {
        getAccounts(addressArr: string[]): Promise<T[]>;
        getNextRoundDelegates(): Promise<T[]>;
        getDelegates(currentGeneraterPublicKeyList: (Uint8Array | string)[]): Promise<T[]>;
        getAccountInfo(address: string): Promise<AccountInfo | undefined>;
        getAccountAssets(address: string): Promise<AccountAssets | undefined>;
        getAccountInfoAndAssets(address: string): Promise<AccountInfoAndAssets | undefined>;
        getDApp(sourceChainMagic: string, dappid: string, currentBlockHeight: number, spec?: {
            address: string;
        }): Promise<boolean | DAppInfo | undefined>;
        getVoteForDelegate(address: string, delegate: string, dappid: string, round: number): Promise<boolean>;
        getLocationName(sourceChainMagic: string, locationName: string, currentBlockHeight: number, spec?: {
            address?: string;
            endsWith?: string;
        }): Promise<boolean | LocationNameInfo | undefined>;
        isLocationNameForbidden(name: string): Promise<boolean>;
        getFrozenAsset(address: string, signature: string): Promise<FrozenAsset | undefined>;
        getAsset(magic: string, assetType: string): Promise<IssuedAssetInfo | undefined>;
        getCurrency(assetType: string): Promise<number | undefined>;
        isCurrencyForbidden(assetType: string): Promise<boolean>;
        getChainMaxTPSPerBlock(): Promise<number>;
        getSubchain(magic: string): Promise<IssuedSubchainInfo | undefined>;
        getAlias(alias: string): Promise<number | undefined>;
        initAccountPublicKey(address: string, publicKey: string, currentBlockHeight: number): Promise<void>;
        mergeAccountMissedBlock(height: number, accountAccumulation: AccountAccumulationInfo): Promise<void>;
        mergeAccountEquity(height: number, accountEquity: AccountEquityInfo): Promise<void>;
        resetDelegateVote(height: number): Promise<void>;
    }
    interface TransactionGetterHelperInterface {
        getTransactionBySignature(signature: string): Promise<TransactionJSON | undefined>;
        getCountTransaction(args: {
            type?: string;
            senderId?: string;
            recipientId?: string;
            signature?: string;
            storageValue?: string;
        }): Promise<number>;
        getPurchaseDApp(address: string, dappid: string): Promise<boolean>;
        checkRepeatInUntreatedTransaction(senderId: string, signature: string): Promise<boolean>;
        checkRepeatInBlockChainTransaction(signature: string): Promise<boolean>;
        getNewDelegates(height: number): Promise<string[]>;
    }
}

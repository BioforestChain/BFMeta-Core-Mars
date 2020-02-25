import { ModuleStroge } from "@bfchain/util";
import { CustomTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, BaseHelper, ConfigHelper, TransactionHelper, ChainAssetInfoHelper, ConfigHelperMap } from "@bfchain/core-helper";
export declare class CustomTransactionEvent {
    accountBaseHelper: AccountBaseHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    transactionHelper: TransactionHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private configMap;
    private moduleMap;
    constructor(accountBaseHelper: AccountBaseHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, transactionHelper: TransactionHelper, chainAssetInfoHelper: ChainAssetInfoHelper, configMap: ConfigHelperMap, moduleMap: ModuleStroge);
    verifyAddress(address: string): void;
    verifyPublicKey(publicKey: string): void;
    verifyRecipientId(recipientId: string): void;
    verifyPossessorAddress(possessorAddress: string): void;
    verifyAssetNumber(assetNumber: string): void;
    verifyMagic(magic: string): void;
    verifyAssetType(assetType: string): void;
    verifyChainName(chainName: string): void;
    verifyDAppid(dappid: string): void;
    verifyMinAndMaxEffectiveHeight(minEffectiveHeight: number, maxEffectiveHeight: number, transaction: CustomTransaction): void;
    verifyLocationName(lns: string): void;
    verifyLocationNameRecord(record: BFChainCore.LocationNameRecordJSON): void;
    verifyApplyResult(applyResult: BFChainCore.ApplyResultJSON, transaction: CustomTransaction): void;
    combineApplyEvent(transaction: CustomTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, applyResult: BFChainCore.ApplyResultJSON): void | Promise<void> | undefined;
}

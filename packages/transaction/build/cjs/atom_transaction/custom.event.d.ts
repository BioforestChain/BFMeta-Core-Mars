import { ModuleStroge } from "@bfchain/util";
import { CustomTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, BaseHelper, ConfigHelper, TransactionHelper, ChainAssetInfoHelper, ConfigHelperMap } from "@bfchain/core-helper";
export declare class CustomTransactionEvent {
    accountHelper: AccountBaseHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    transactionHelper: TransactionHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private configMap;
    private moduleMap;
    constructor(accountHelper: AccountBaseHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, transactionHelper: TransactionHelper, chainAssetInfoHelper: ChainAssetInfoHelper, configMap: ConfigHelperMap, moduleMap: ModuleStroge);
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
    /**
     * 校验解析值是否合法
     *
     * @param record
     */
    verifyLocationNameRecord(record: BFChainCore.LocationNameRecordJSON): void;
    verifyApplyResult(applyResult: BFChainCore.ApplyResultJSON, transaction: CustomTransaction): void;
    combineApplyEvent(transaction: CustomTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, applyResult: BFChainCore.ApplyResultJSON): unknown;
}
//# sourceMappingURL=custom.event.d.ts.map
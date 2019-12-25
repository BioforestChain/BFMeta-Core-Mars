import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { IssueAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper } from "@bfchain/core-helper-account";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
export declare class IssueAssetLogicVerifier extends TransactionLogicVerifier {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper);
    verify(transaction: IssueAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 发起账户是否是链域名的拥有者账户或管理账户
     *
     * @param transaction
     * @param currentBlockHeight
     */
    isLocationNamePossessorOrManager(transaction: IssueAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 发起账户是否是 dappid 的拥有者账户
     *
     * @param transaction
     * @param currentBlockHeight
     */
    isDAppidPossessor(transaction: IssueAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 校验资产最大的发行量
     *
     * @param expectedIssuedAssets
     * @param remainChainAsset
     */
    checkMaxIssueAssets(expectedIssuedAssets: bigint, remainChainAsset: bigint): void;
    /**
     * 资产名是否已经存在
     *
     * @param assetType
     */
    isAssetTypeForbidden(assetType: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 资产名是否已经存在
     *
     * @param assetType
     */
    isAssetTypeAlreadyExist(assetType: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 资产是否已经存在
     *
     * @param magic
     * @param assetType
     */
    isAssetAlreadyExist(magic: string, assetType: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 资产的创世账户是否给资产的发行账户转过账
     *
     * @param transaction
     */
    isGenesisAccountTransferToApplyAccount(transaction: IssueAssetTransaction, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
}
//# sourceMappingURL=issueAssetLogicVerifier.d.ts.map
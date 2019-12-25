import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { IssueSubchainTransaction } from "@bfchain/core-model";
export declare class IssueSubchainLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: IssueSubchainTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 发起账户是否是链域名的拥有者账户或管理账户
     *
     * @param transaction
     * @param currentBlockHeight
     */
    isLocationNamePossessorOrManager(transaction: IssueSubchainTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 发起账户是否是 dappid 的拥有者账户
     *
     * @param transaction
     * @param currentBlockHeight
     */
    isDAppidPossessor(transaction: IssueSubchainTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 链名是否被禁用
     *
     * @param name
     */
    isSubchainNameForbidden(name: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 链名是否已经存在
     *
     * @param name
     */
    isSubchainNameAlreadyExist(name: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 链名是否被禁用
     *
     * @param name
     */
    isSubchainAssetTypeForbidden(assetType: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 链资产名是否已经存在
     *
     * @param assetType
     */
    isSubchainAssetTypeAlreadyExist(assetType: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 创世节点地址(链域名)是否已经存在
     *
     * @param genesisNodeAddress
     * @param magic
     * @param currentBlockHeight
     */
    isGenesisNodeAddressAlreadyExist(genesisNodeAddress: string, magic: string, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 资产是否已经存在
     *
     * @param transaction
     * @param issueSubchain
     */
    isSubchainAlreadyExist(magic: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 校验资产最大的发行量
     * 子链的每个块最大交易量不能大于已知子链每个块最大交易量的 2 倍
     *
     * @param subchainMaxTPSPerBlock
     */
    checkMaxTPSPerBlock(subchainMaxTPSPerBlock: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
//# sourceMappingURL=issueSubchainLogicVerifier.d.ts.map
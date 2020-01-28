import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { NewTransactionRefuseReason, IssueAssetTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { AccountBaseHelper } from "@bfchain/core-helper-account";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import {
  CoreExceptionGenerator,
  ASSET_NOT_ENOUGH,
  ACCOUNT_CAN_NOT_BE_FROZEN,
  TOO_MANY_EXPECTEDISSUEDASSETS,
  ALREADY_EXIST,
  NOT_EXIST,
  TRANSFER_TO_SENDER_BEFORE,
  ASSET_NOT_EXIST,
  FORBIDDEN,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "IssueAssetLogicVerifier",
);

@Injectable()
export class IssueAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper) public accountHelper: AccountBaseHelper,
    @Inject(AccountBaseHelper) public transactionHelper: TransactionHelper,
  ) {
    super();
  }

  async verify(
    transaction: IssueAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    const issueAsset = transaction.asset.issueAsset;

    // 保证账户上足够的本链资产，避免 py 操作
    const {
      magic: chainMagic,
      assetType: chainAssetType,
      issueAssetMinChainAsset,
    } = this.configHelper;
    const { accountAssets } = sender;

    this.isPossessAssetExceptForChainAsset(accountAssets);

    const remainBalance =
      BigInt(accountAssets[chainMagic][chainAssetType].assetNumber) - BigInt(transaction.fee);
    if (BigInt(issueAssetMinChainAsset) > remainBalance) {
      throw new ConsensusException(ASSET_NOT_ENOUGH, {
        reason: `No enough asset, Min account asset ${issueAssetMinChainAsset}, remain Assets: ${remainBalance}`,
        errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
        function: "verify",
      });
    }

    await this.isLocationNamePossessorOrManager(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
    );
    await this.isDAppidPossessor(transaction, currentBlockHeight, accountGetterHelper);
    this.checkMaxIssueAssets(BigInt(issueAsset.expectedIssuedAssets), remainBalance);
    await this.isAssetTypeForbidden(issueAsset.assetType, accountGetterHelper);
    await this.isAssetTypeAlreadyExist(issueAsset.assetType, accountGetterHelper);
    await this.isAssetAlreadyExist(chainMagic, issueAsset.assetType, accountGetterHelper);
    await this.isGenesisAccountTransferToApplyAccount(transaction, transactionGetterHelper);

    return true;
  }

  /**
   * 发起账户是否是链域名的拥有者账户或管理账户
   *
   * @param transaction
   * @param currentBlockHeight
   */
  async isLocationNamePossessorOrManager(
    transaction: IssueAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isLocationNamePossessorOrManager",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 资产的发行账户不能是链域名的拥有者账户或管理账户
    const memLocationName = await accountGetterHelper.getLocationName(
      transaction.fromMagic,
      "",
      currentBlockHeight,
      {
        address: transaction.senderId,
      },
    );
    if (memLocationName) {
      throw new ConsensusException(ACCOUNT_CAN_NOT_BE_FROZEN, {
        address: transaction.senderId,
        reason: "Location name possessor or manager can not initiate a asset transaction",
        errorId: NewTransactionRefuseReason.LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_ASSET,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 发起账户是否是 dappid 的拥有者账户
   *
   * @param transaction
   * @param currentBlockHeight
   */
  async isDAppidPossessor(
    transaction: IssueAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isDAppidPossessor",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 资产的发行账户不能是dapp的拥有者
    const memDApp = await accountGetterHelper.getDApp(
      transaction.fromMagic,
      "",
      currentBlockHeight,
      { address: transaction.senderId },
    );
    if (memDApp) {
      throw new ConsensusException(ACCOUNT_CAN_NOT_BE_FROZEN, {
        address: transaction.senderId,
        reason: "DApp id possessor can not initiate a asset transaction",
        errorId: NewTransactionRefuseReason.DAPP_POSSESSOR_CAN_NOT_ISSUE_ASSET,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验资产最大的发行量
   *
   * @param expectedIssuedAssets
   * @param remainChainAsset
   */
  checkMaxIssueAssets(expectedIssuedAssets: bigint, remainChainAsset: bigint) {
    // 验证数字资产的最大发行数量
    const maxIssueAssets =
      remainChainAsset * BigInt(this.configHelper.chainAssetAndDigitalAssetExchangeRate);
    if (expectedIssuedAssets > maxIssueAssets) {
      throw new ConsensusException(TOO_MANY_EXPECTEDISSUEDASSETS, {
        reason: `Remain balance: ${remainChainAsset.toString()}, max isseuedAssets: ${maxIssueAssets.toString()}, received expectedIssuedAssets: ${expectedIssuedAssets.toString()}`,
        function: "checkMaxIssueAssets",
      });
    }
  }

  /**
   * 资产名是否已经存在
   *
   * @param assetType
   */
  async isAssetTypeForbidden(assetType: string, accountGetterHelper = this.accountGetterHelper) {
    const Function_Exception_Detail = {
      function: "isAssetTypeForbidden",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 验证资产名是否被禁用
    const result = await accountGetterHelper.isCurrencyForbidden(assetType);
    if (result) {
      throw new ConsensusException(FORBIDDEN, {
        prop: `AssetType ${assetType}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 资产名是否已经存在
   *
   * @param assetType
   */
  async isAssetTypeAlreadyExist(assetType: string, accountGetterHelper = this.accountGetterHelper) {
    const Function_Exception_Detail = {
      function: "isAssetTypeAlreadyExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 验证资产名是否已经存在
    const memLegalCurrency = await accountGetterHelper.getCurrency(assetType);
    if (memLegalCurrency) {
      throw new ConsensusException(ALREADY_EXIST, {
        prop: `AssetType ${assetType}`,
        target: "blockChain",
        errorId: NewTransactionRefuseReason.ASSETTYPE_ALREADY_EXIST,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 资产是否已经存在
   *
   * @param magic
   * @param assetType
   */
  async isAssetAlreadyExist(
    magic: string,
    assetType: string,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isAssetAlreadyExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 验证资产是否已经存在
    const memAssets = await accountGetterHelper.getAsset(magic, assetType);
    if (memAssets) {
      throw new ConsensusException(ASSET_NOT_EXIST, {
        magic,
        assetType,
        errorId: NewTransactionRefuseReason.ASSET_ALREADY_EXIST,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 资产的创世账户是否给资产的发行账户转过账
   *
   * @param transaction
   */
  async isGenesisAccountTransferToApplyAccount(
    transaction: IssueAssetTransaction,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isGenesisAccountTransferToApplyAccount",
    } as const;
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 查询指定的创世账户是否已经给发起账户转过账
    const countTrs = await transactionGetterHelper.getCountTransaction({
      senderId: transaction.asset.issueAsset.genesisAddress,
      recipientId: transaction.senderId,
      type: this.transactionHelper.TRANSFER_ASSET,
    });
    if (countTrs < 1) {
      throw new ConsensusException(TRANSFER_TO_SENDER_BEFORE, {
        genesisAddress: transaction.asset.issueAsset.genesisAddress,
        senderAddress: transaction.senderId,
        ...Function_Exception_Detail,
      });
    }
  }
}

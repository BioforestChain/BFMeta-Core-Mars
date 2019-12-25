import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { NewTransactionRefuseReason, IssueSubchainTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  SUBCHAIN_CAN_NOT_ISSUE_SUBCHAIN,
  NOT_EXIST,
  ASSET_NOT_ENOUGH,
  ACCOUNT_CAN_NOT_BE_FROZEN,
  ALREADY_EXIST,
  LOCATION_NAME_IS_NOT_EXIST,
  TOO_LARGE,
  FORBIDDEN,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "IssueSubchainLogicVerifier",
);

@Injectable()
export class IssueSubchainLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: IssueSubchainTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    const issueSubchain = transaction.asset.issueSubchain;

    // 保证账户上足够的本链资产，避免 py 操作
    const {
      magic: chainMagic,
      assetType: chainAssetType,
      issueSubchainMinChainAsset,
      parentGenesisBlock,
    } = this.configHelper;
    const { accountAssets } = sender;

    this.isPossessAssetExceptForChainAsset(accountAssets);

    // 子链不能再次发行子链
    if (parentGenesisBlock) {
      throw new ConsensusException(SUBCHAIN_CAN_NOT_ISSUE_SUBCHAIN, {
        magic: parentGenesisBlock.remark.magic,
        ...Function_Exception_Detail,
      });
    }

    const remainBalance =
      BigInt(accountAssets[chainMagic][chainAssetType].assetNumber) - BigInt(transaction.fee);
    if (BigInt(issueSubchainMinChainAsset) > remainBalance) {
      throw new ConsensusException(ASSET_NOT_ENOUGH, {
        reason: `No enough asset, Min account asset ${issueSubchainMinChainAsset}, remain Assets: ${remainBalance}`,
        errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
        ...Function_Exception_Detail,
      });
    }

    await this.isLocationNamePossessorOrManager(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
    );
    await this.isDAppidPossessor(transaction, currentBlockHeight, accountGetterHelper);
    await this.checkMaxTPSPerBlock(issueSubchain.maxTPSPerBlock, accountGetterHelper);
    await this.isSubchainNameForbidden(issueSubchain.chainName, accountGetterHelper);
    await this.isSubchainNameAlreadyExist(issueSubchain.chainName, accountGetterHelper);
    await this.isSubchainAssetTypeForbidden(issueSubchain.assetType, accountGetterHelper);
    await this.isSubchainAssetTypeAlreadyExist(issueSubchain.assetType, accountGetterHelper);
    // FIXME: 子链的创世链域名不需要在父链创建，而且二者根域名不同无法创建
    // 链上域名的根域名都是链名
    // await this.isGenesisNodeAddressAlreadyExist(
    //   issueSubchain.genesisNodeAddress,
    //   issueSubchain.magic,
    //   currentBlockHeight,
    //   accountGetterHelper,
    // );
    await this.isSubchainAlreadyExist(issueSubchain.magic, accountGetterHelper);

    return true;
  }

  /**
   * 发起账户是否是链域名的拥有者账户或管理账户
   *
   * @param transaction
   * @param currentBlockHeight
   */
  async isLocationNamePossessorOrManager(
    transaction: IssueSubchainTransaction,
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
        reason: "Location name possessor or manager can not initiate a subchain transaction",
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
    transaction: IssueSubchainTransaction,
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
        reason: "DApp id possessor can not initiate a subchain transaction",
        errorId: NewTransactionRefuseReason.DAPP_POSSESSOR_CAN_NOT_ISSUE_ASSET,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 链名是否被禁用
   *
   * @param name
   */
  async isSubchainNameForbidden(name: string, accountGetterHelper = this.accountGetterHelper) {
    const Function_Exception_Detail = {
      function: "isSubchainNameForbidden",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const result = await accountGetterHelper.isCurrencyForbidden(name);
    // 子链名禁止使用
    if (result) {
      throw new ConsensusException(FORBIDDEN, {
        prop: `Subchain name ${name}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 链名是否已经存在
   *
   * @param name
   */
  async isSubchainNameAlreadyExist(name: string, accountGetterHelper = this.accountGetterHelper) {
    const Function_Exception_Detail = {
      function: "isSubchainNameAlreadyExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const memLegalCurrency = await accountGetterHelper.getCurrency(name);
    // 子链名已经存在
    if (memLegalCurrency) {
      throw new ConsensusException(ALREADY_EXIST, {
        prop: `Subchain name ${name}`,
        target: "blockChain",
        errorId: NewTransactionRefuseReason.CHAINNAME_ALREADY_EXIST,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 链名是否被禁用
   *
   * @param name
   */
  async isSubchainAssetTypeForbidden(
    assetType: string,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isSubchainAssetTypeForbidden",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const result = await accountGetterHelper.isCurrencyForbidden(assetType);
    // 子链资产名禁止使用
    if (result) {
      throw new ConsensusException(FORBIDDEN, {
        prop: `Subchain assetType ${assetType}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 链资产名是否已经存在
   *
   * @param assetType
   */
  async isSubchainAssetTypeAlreadyExist(
    assetType: string,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isSubchainAssetTypeAlreadyExist",
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
        prop: `Subchain assetType ${assetType}`,
        target: "blockChain",
        errorId: NewTransactionRefuseReason.ASSETTYPE_ALREADY_EXIST,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 创世节点地址(链域名)是否已经存在
   *
   * @param genesisNodeAddress
   * @param magic
   * @param currentBlockHeight
   */
  async isGenesisNodeAddressAlreadyExist(
    genesisNodeAddress: string,
    magic: string,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isGenesisNodeAddressAlreadyExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const memLocation = await accountGetterHelper.getLocationName(
      magic,
      genesisNodeAddress,
      currentBlockHeight,
    );
    if (!memLocation) {
      throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
        locationName: genesisNodeAddress,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 资产是否已经存在
   *
   * @param transaction
   * @param issueSubchain
   */
  async isSubchainAlreadyExist(magic: string, accountGetterHelper = this.accountGetterHelper) {
    const Function_Exception_Detail = {
      function: "isSubchainAlreadyExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 查询本地是否已经存在这个子链, 注意忽略大小写
    const memSubchain = await accountGetterHelper.getSubchain(magic);
    if (memSubchain) {
      throw new ConsensusException(ALREADY_EXIST, {
        prop: `Subchain with magic ${magic}}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验资产最大的发行量
   * 子链的每个块最大交易量不能大于已知子链每个块最大交易量的 2 倍
   *
   * @param subchainMaxTPSPerBlock
   */
  async checkMaxTPSPerBlock(
    subchainMaxTPSPerBlock: number,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "checkMaxTPSPerBlock",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 验证数字资产的最大发行数量
    // 子链的每个块最大交易量不能大于已知子链每个块最大交易量的 2 倍
    let maxTPSPerBlock = await accountGetterHelper.getChainMaxTPSPerBlock();
    if (maxTPSPerBlock < this.configHelper.maxTPSPerBlock) {
      maxTPSPerBlock = this.configHelper.maxTPSPerBlock;
    }

    if (subchainMaxTPSPerBlock > maxTPSPerBlock * 2) {
      throw new ConsensusException(TOO_LARGE, {
        prop: "maxTPSPerBlock",
        reason: "Subchain max transaction per block is too large",
        errorId: NewTransactionRefuseReason.SUBCHAIN_MAXTPSPERBLOCK_TOO_BIG,
        ...Function_Exception_Detail,
      });
    }
  }
}

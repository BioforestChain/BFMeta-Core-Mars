import { QueneEventEmitter, Injectable, Inject, getHexFromArrayBuffer } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ASSET_NOT_ENOUGH,
  NOT_EXIST,
  NOT_BEGIN_UNFROZEN_YET,
  FROZEN_ASSET_EXPIRATION,
  EQUITY_NOT_ENOUGH,
  ACCOUNT_FROZEN,
  USERNAME_ALREADY_EXIST,
  ACCOUNT_IS_NOT_AN_DELEGATE,
  DELEGATE_IS_ALREADY_ACCEPT_VOTE,
  ACCOUNT_IS_ALREADY_AN_DELEGATE,
  DELEGATE_IS_ALREADY_REJECT_VOTE,
  ACCOUNT_CAN_NOT_BE_FROZEN,
  TOO_MANY_EXPECTEDISSUEDASSETS,
  FORBIDDEN,
  ALREADY_EXIST,
  ASSET_NOT_EXIST,
  TRANSFER_TO_SENDER_BEFORE,
  CAN_NOT_DESTORY_ASSET,
  DAPPID_IS_ALREADY_EXIST,
  DAPPID_IS_NOT_EXIST,
  NO_NEED_TO_PURCHASE_SPECIAL_ASSET,
  ACCOUNT_NOT_DAPPID_POSSESSOR,
  DAPPID_ALREADY_FROZEN,
  LOCATION_NAME_IS_NOT_EXIST,
  ACCOUNT_NOT_LOCATION_NAME_POSSESSOR,
  LOCATION_NAME_ALREADY_FROZEN,
  ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE,
  POSSESS_ASSET_EXCEPT_CHAIN_ASSET,
  CAN_NOT_DELETE_LOCATION_NAME,
  SET_LOCATION_NAME_MANAGER_FIELD,
  SET_LOCATION_NAME_RECORD_VALUE_FIELD,
  UNFROZEN_TIME_USE_UP,
  REGISTER_DELEGTE_QUOTA_FULL,
} from "@bfchain/core-util-exception";
import {
  NewTransactionRefuseReason,
  ACCOUNT_STATUS,
  ASSET_STATUS,
  LOCATION_NAME_LEVEL,
  RECORD_OPERATION_TYPE,
} from "@bfchain/core-model";
import { ConfigHelper, BlockHelper, TransactionHelper } from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "EventLogicVerifier",
);

@Injectable()
export class EventLogicVerifier {
  @Inject(ConfigHelper)
  protected configHelper!: ConfigHelper;
  @Inject(BlockHelper)
  protected blockHelper!: BlockHelper;
  @Inject(TransactionHelper)
  protected transactionHelper!: TransactionHelper;
  @Inject("bfchain-core:TransactionCore")
  protected transactionCore!: import("@bfchain/core-transaction").TransactionCore;

  private deepClone<T>(obj: T): T {
    const result = Array.isArray(obj) ? ([] as any) : ({} as T);
    if (typeof obj === "object") {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === "object") {
          result[key] = this.deepClone(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
      return result;
    } else {
      return obj;
    }
  }

  /**
   * 账户是否持有除链资产外其他资产
   *
   * @param assets
   */
  private isPossessAssetExceptForChainAsset(assets: BFChainCore.AccountAssets) {
    for (const magic in assets) {
      const magicAssets = assets[magic];
      for (const assetType in magicAssets) {
        if (assetType !== this.configHelper.assetType) {
          if (magicAssets[assetType].assetNumber > BigInt(0)) {
            throw new ConsensusException(POSSESS_ASSET_EXCEPT_CHAIN_ASSET, {
              function: "isPossessAssetExceptForChainAsset",
            });
          }
        }
      }
    }
  }

  private addRecord(
    locationName: string,
    addRecord: BFChainCore.LocationNameRecordJSON,
    records: BFChainCore.LocationNameRecordInfo,
  ) {
    const { recordType, recordValue } = addRecord;
    if (records && records[recordType] && records[recordType][recordValue]) {
      throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
        locationName,
        reason: "New location name record value already exist",
        function: "addRecord",
      });
    }
  }

  private deleteRecord(
    locationName: string,
    deleteRecord: BFChainCore.LocationNameRecordJSON,
    records: BFChainCore.LocationNameRecordInfo,
  ) {
    const { recordType, recordValue } = deleteRecord;
    if (!(records[recordType] && records[recordType][recordValue])) {
      throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
        locationName,
        reason: "Delete location name record value not exist",
        function: "deleteRecord",
      });
    }
  }

  // 事件逻辑校验
  async eventLogicVerifier(
    transaction: BFChainCore.Transaction,
    sender: BFChainCore.AccountInfoAndAssets,
    recipient: BFChainCore.AccountInfoAndAssets | undefined,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface<any>,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const accountsAssets = {
      [transaction.senderId]: this.deepClone(sender.accountAssets),
    };
    const accountsInfo = {
      [transaction.senderId]: this.deepClone(sender.accountInfo),
    };
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      accountsAssets[address] = this.deepClone(recipient.accountAssets);
      accountsInfo[address] = this.deepClone(recipient.accountInfo);
    }

    const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);

    const event = new QueneEventEmitter<BFChainCore.ApplyTransactionEventMap>();
    // 交易的总手续费
    let trsFee = BigInt(0);

    // 扣除手续费
    event.on("fee", ({ applyInfo }, next) => {
      // 手续费扣除的只能是链资产
      const { magic, assetType } = this.configHelper;
      const fee = BigInt(applyInfo.amount);
      const address = applyInfo.address;
      accountsAssets[address] = accountsAssets[address] || {};
      accountsAssets[address][magic] = accountsAssets[address][magic] || {};
      accountsAssets[address][magic][assetType] = accountsAssets[address][magic][assetType] || {
        sourceChainMagic: magic,
        assetType,
        assetNumber: BigInt(0),
        history: {},
      };
      const hodingAsset = accountsAssets[address][magic][assetType];
      const remainAsset = hodingAsset.assetNumber;
      hodingAsset.assetNumber += fee;
      trsFee += fee;
      if (hodingAsset.assetNumber < BigInt(0)) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `Transaction signature: ${transaction.signature} address: ${address} magic ${
            applyInfo.assetInfo.magic
          } assetType: ${
            applyInfo.assetInfo.assetType
          } hodingAsset: ${remainAsset.toString()} spendFee: ${applyInfo.amount}`,
          errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 扣除资产
    event.on("asset", ({ applyInfo }, next) => {
      const { magic, assetType } = applyInfo.assetInfo;
      const address = applyInfo.address;
      accountsAssets[address] = accountsAssets[address] || {};
      accountsAssets[address][magic] = accountsAssets[address][magic] || {};
      accountsAssets[address][magic][assetType] = accountsAssets[address][magic][assetType] || {
        sourceChainMagic: magic,
        assetType,
        assetNumber: BigInt(0),
        history: {},
      };
      const hodingAsset = accountsAssets[address][magic][assetType];
      const remainAsset = hodingAsset.assetNumber;
      hodingAsset.assetNumber += BigInt(applyInfo.amount);
      if (hodingAsset.assetNumber < BigInt(0)) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `Transaction signature: ${transaction.signature} address: ${address} magic ${
            applyInfo.assetInfo.magic
          } assetType: ${
            applyInfo.assetInfo.assetType
          } hodingAsset: ${remainAsset.toString()} spendAsset: ${applyInfo.amount}`,
          errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 冻结资产
    event.on("frozenAsset", async ({ applyInfo }, next) => {
      const { magic, assetType } = applyInfo.assetInfo;
      const address = applyInfo.address;
      accountsAssets[address] = accountsAssets[address] || {};
      accountsAssets[address][magic] = accountsAssets[address][magic] || {};
      accountsAssets[address][magic][assetType] = accountsAssets[address][magic][assetType] || {
        sourceChainMagic: magic,
        assetType,
        assetNumber: BigInt(0),
        history: {},
      };
      const hodingAsset = accountsAssets[address][magic][assetType];
      const remainAsset = hodingAsset.assetNumber;
      hodingAsset.assetNumber += BigInt(applyInfo.amount);
      if (hodingAsset.assetNumber < BigInt(0)) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `Transaction signature: ${transaction.signature} address: ${address} magic ${
            applyInfo.assetInfo.magic
          } assetType: ${
            applyInfo.assetInfo.assetType
          } hodingAsset: ${remainAsset.toString()} frozenAsset: ${applyInfo.amount}`,
          errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 解冻资产
    event.on("unfrozenAsset", async ({ applyInfo }, next) => {
      const { assetInfo, frozenIdBuffer, amount: spendAsset } = applyInfo;
      const { magic, assetType } = assetInfo;
      const transactionSignature = getHexFromArrayBuffer(frozenIdBuffer);
      const trs = await transactionGetterHelper.getTransactionBySignature(transactionSignature);

      if (!trs) {
        throw new NoFoundException(NOT_EXIST, {
          prop: `Transaction with signature ${transactionSignature}`,
          target: "grabAsset",
          ...Function_Exception_Detail,
        });
      }

      // 获取冻结信息
      const frozenAsset = await accountGetterHelper.getFrozenAsset(
        trs.senderId,
        transactionSignature,
      );

      if (!frozenAsset) {
        throw new ConsensusException(NOT_EXIST, {
          prop: `Frozen asset with signature ${transactionSignature}`,
          target: "blockChain",
          ...Function_Exception_Detail,
        });
      }

      const {
        maxEffectiveHeight,
        minEffectiveHeight,
        remainUnfrozenTimes,
        amount: remainAsset,
      } = frozenAsset;
      // 是否到达解冻高度
      if (minEffectiveHeight > transaction.applyBlockHeight) {
        throw new ConsensusException(NOT_BEGIN_UNFROZEN_YET, {
          frozenId: transactionSignature,
          ...Function_Exception_Detail,
        });
      }

      // 交易交易是否过期
      if (currentBlockHeight > maxEffectiveHeight) {
        throw new ConsensusException(FROZEN_ASSET_EXPIRATION, {
          frozenId: transactionSignature,
          ...Function_Exception_Detail,
        });
      }

      if (maxEffectiveHeight < transaction.applyBlockHeight) {
        throw new ConsensusException(FROZEN_ASSET_EXPIRATION, {
          frozenId: transactionSignature,
          ...Function_Exception_Detail,
        });
      }

      // 剩余资产是否足够
      if (BigInt(spendAsset) > BigInt(remainAsset)) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `No enough asset to unfrozen magic ${magic} assetType ${assetType} remain ${remainAsset} spend ${spendAsset}`,
          ...Function_Exception_Detail,
        });
      }

      // 剩余解冻次数是否足够
      if (remainUnfrozenTimes && remainUnfrozenTimes === 0) {
        throw new ConsensusException(UNFROZEN_TIME_USE_UP, {
          frozenId: transactionSignature,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 扣除权益
    event.on("voteEquity", ({ applyInfo }, next) => {
      const round = curRound - 1;
      const address = applyInfo.address;
      accountsInfo[address] = accountsInfo[address] || {};
      const equityInfo = accountsInfo[address].equityInfo;
      const minEquity = BigInt(0);
      let accountEquity = equityInfo.round === round ? equityInfo.equity : minEquity;
      const remainEquity = accountEquity;
      accountEquity += BigInt(applyInfo.equity);
      if (accountEquity < minEquity) {
        throw new ConsensusException(EQUITY_NOT_ENOUGH, {
          reason: `Transaction signature: ${
            transaction.signature
          } address: ${address} hodingEquity: ${remainEquity.toString()} spendEquity: ${
            applyInfo.equity
          }`,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 冻结账户
    event.on("frozenAccount", ({ applyInfo }, next) => {
      const { address } = applyInfo;
      accountsInfo[address] = accountsInfo[address] || {};
      const accountStatus = accountsInfo[address].accountStatus;
      if (
        accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
        accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
        accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
      ) {
        throw new ConsensusException(ACCOUNT_FROZEN, {
          address,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 设置用户名
    event.on("setUsername", async ({ applyInfo }, next) => {
      const { address, alias } = applyInfo;
      // 这个不统一做
      //   if (accountsInfo[address].username) {
      //     throw new ConsensusException(ACCOUNT_ALREADY_HAVE_USERNAME, {
      //       errorId: NewTransactionRefuseReason.ACCOUNT_ALREADY_HAVE_USERNAME,
      //       ...Function_Exception_Detail,
      //     });
      //   }

      const memUsername = await accountGetterHelper.getAlias(alias);
      if (memUsername) {
        throw new ConsensusException(USERNAME_ALREADY_EXIST, {
          errorId: NewTransactionRefuseReason.USERNAME_ALREADY_EXIST,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 设置二次密码
    event.on("setSecondPublicKey", ({ applyInfo }, next) => {
      next();
    });

    // 注册成为受托人
    event.on("registerToDelegate", async ({ applyInfo }, next) => {
      const { address } = applyInfo;

      if (accountsInfo[address].isDelegate) {
        throw new ConsensusException(ACCOUNT_IS_ALREADY_AN_DELEGATE, {
          address,
          errorId: NewTransactionRefuseReason.ACCOUNT_ALREADY_DELEGATE,
          ...Function_Exception_Detail,
        });
      }

      const { blockPerRound, maxDelegateTxsPerRound } = this.configHelper;
      const txCount = await transactionGetterHelper.getCountTransaction({
        type: this.transactionHelper.DELEGATE,
        startHeight: (curRound - 1) * blockPerRound + 1,
        endHeight: curRound * blockPerRound,
      });

      if (txCount >= maxDelegateTxsPerRound) {
        throw new ConsensusException(REGISTER_DELEGTE_QUOTA_FULL, {
          round: curRound,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 开启接收投票
    event.on("acceptVote", ({ applyInfo }, next) => {
      const { address } = applyInfo;
      accountsInfo[address] = accountsInfo[address] || {};
      if (!accountsInfo[address].isDelegate) {
        throw new ConsensusException(ACCOUNT_IS_NOT_AN_DELEGATE, {
          address,
          ...Function_Exception_Detail,
        });
      }

      if (accountsInfo[address].isAcceptVote) {
        throw new ConsensusException(DELEGATE_IS_ALREADY_ACCEPT_VOTE, {
          address,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 关闭接收投票
    event.on("rejectVote", ({ applyInfo }, next) => {
      const { address } = applyInfo;
      accountsInfo[address] = accountsInfo[address] || {};
      if (!accountsInfo[address].isDelegate) {
        throw new ConsensusException(ACCOUNT_IS_NOT_AN_DELEGATE, {
          address,
          ...Function_Exception_Detail,
        });
      }

      if (!accountsInfo[address].isAcceptVote) {
        throw new ConsensusException(DELEGATE_IS_ALREADY_REJECT_VOTE, {
          address,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 发行数字资产
    event.on("issueAsset", async ({ applyInfo }, next) => {
      const { address, assetType, genesisAddress, expectedIssuedAssets } = applyInfo;

      // 是否持有除链资产外的其他资产
      this.isPossessAssetExceptForChainAsset(accountsAssets[address]);

      // 资产的发行账户不能是dapp的拥有者
      const memDApp = await accountGetterHelper.getDApp(
        transaction.fromMagic,
        "",
        currentBlockHeight,
        {
          address,
        },
      );
      if (memDApp) {
        throw new ConsensusException(ACCOUNT_CAN_NOT_BE_FROZEN, {
          address,
          reason: "DApp id possessor can not initiate a asset transaction",
          errorId: NewTransactionRefuseReason.DAPP_POSSESSOR_CAN_NOT_ISSUE_ASSET,
          ...Function_Exception_Detail,
        });
      }

      // 资产的发行账户不能是链域名的拥有者账户或管理账户
      const memLocationName = await accountGetterHelper.getLocationName(
        transaction.fromMagic,
        "",
        currentBlockHeight,
        {
          address,
        },
      );
      if (memLocationName) {
        throw new ConsensusException(ACCOUNT_CAN_NOT_BE_FROZEN, {
          address,
          reason: "Location name possessor or manager can not initiate a asset transaction",
          errorId: NewTransactionRefuseReason.LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_ASSET,
          ...Function_Exception_Detail,
        });
      }

      // 保证账户上足够的本链资产，避免 py 操作
      const {
        magic: chainMagic,
        assetType: chainAssetType,
        issueAssetMinChainAsset,
      } = this.configHelper;
      const remainChainAsset =
        accountsAssets[address][chainMagic][chainAssetType].assetNumber - BigInt(transaction.fee);
      if (BigInt(issueAssetMinChainAsset) > remainChainAsset) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `No enough asset, Min account asset ${issueAssetMinChainAsset}, remain Assets: ${remainChainAsset}`,
          errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
          function: "verify",
        });
      }

      // 验证数字资产的最大发行数量
      const maxIssueAssets =
        BigInt(remainChainAsset) * BigInt(this.configHelper.chainAssetAndDigitalAssetExchangeRate);
      if (BigInt(expectedIssuedAssets) > maxIssueAssets) {
        throw new ConsensusException(TOO_MANY_EXPECTEDISSUEDASSETS, {
          reason: `Remain chain asset: ${remainChainAsset.toString()}, max isseuedAssets: ${maxIssueAssets.toString()}, received expectedIssuedAssets: ${expectedIssuedAssets.toString()}`,
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

      // 验证资产是否已经存在
      const memAssets = await accountGetterHelper.getAsset(chainMagic, assetType);
      if (memAssets) {
        throw new ConsensusException(ASSET_NOT_EXIST, {
          magic: chainMagic,
          assetType,
          errorId: NewTransactionRefuseReason.ASSET_ALREADY_EXIST,
          ...Function_Exception_Detail,
        });
      }

      // 查询指定的创世账户是否已经给发起账户转过账
      const countTrs = await transactionGetterHelper.getCountTransaction({
        senderId: genesisAddress,
        recipientId: transaction.senderId,
        type: this.transactionHelper.TRANSFER_ASSET,
      });
      if (countTrs < 1) {
        throw new ConsensusException(TRANSFER_TO_SENDER_BEFORE, {
          genesisAddress,
          senderAddress: transaction.senderId,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 资产销毁
    event.on("destoryAsset", async ({ applyInfo }, next) => {
      const { assetInfo, amount, address } = applyInfo;
      const { magic, assetType } = assetInfo;

      // 查询本地是否已经存在这个数字资产(注意忽略大小写)
      const memAssets = await accountGetterHelper.getAsset(magic, assetType);
      if (!memAssets) {
        // 不存在的资产不能被销毁
        throw new ConsensusException(ASSET_NOT_EXIST, {
          magic,
          assetType,
          ...Function_Exception_Detail,
        });
      }

      // 资产的创世账户不能销毁资产
      if (memAssets.genesisAddress === transaction.senderId) {
        throw new ConsensusException(CAN_NOT_DESTORY_ASSET, {
          address: transaction.senderId,
          magic,
          assetType,
          reason: "assets genesis account can't destory assets",
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 发行 dapid
    event.on("issueDAppid", async ({ applyInfo }, next) => {
      const { dappid, sourceChainMagic, purchaseAsset } = applyInfo;
      // 用于购买的资产是否合法
      if (purchaseAsset) {
        const { sourceChainMagic, assetType, amount } = purchaseAsset;
        const memAsset = await accountGetterHelper.getAsset(sourceChainMagic, assetType);
        if (!memAsset) {
          throw new ConsensusException(ASSET_NOT_EXIST, {
            magic: sourceChainMagic,
            assetType,
            ...Function_Exception_Detail,
          });
        }

        if (
          sourceChainMagic !== this.configHelper.magic &&
          assetType !== this.configHelper.assetType
        ) {
          if (memAsset.remainAssets < BigInt(amount)) {
            throw new ConsensusException(ASSET_NOT_ENOUGH, {
              reason: `Purchase asset amount greater than remain assets, spend ${amount}, remain ${memAsset.remainAssets}`,
              errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
              ...Function_Exception_Detail,
            });
          }
        }
      }

      // dappid 是否已经存在
      const memDapp = await accountGetterHelper.getDApp(
        sourceChainMagic,
        dappid,
        currentBlockHeight,
      );
      if (memDapp) {
        throw new ConsensusException(DAPPID_IS_ALREADY_EXIST, {
          dappid,
          errorId: NewTransactionRefuseReason.DAPP_ALREADY_EXISTS,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 出售 dappid
    event.on("saleDAppid", async ({ applyInfo }, next) => {
      const { address, sourceChainMagic, dappid } = applyInfo;

      const memDapp = (await accountGetterHelper.getDApp(
        sourceChainMagic,
        dappid,
        currentBlockHeight,
      )) as BFChainCore.DAppInfo | undefined;
      if (!memDapp) {
        throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
          dappid,
          ...Function_Exception_Detail,
        });
      }
      if (memDapp.possessorAddress !== address) {
        throw new ConsensusException(ACCOUNT_NOT_DAPPID_POSSESSOR, {
          address,
          dappid,
          ...Function_Exception_Detail,
        });
      }
      if (memDapp.status === ASSET_STATUS.FROZEN) {
        throw new ConsensusException(DAPPID_ALREADY_FROZEN, {
          dappid,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 购买 dappid
    event.on("purchaseDAppid", async ({ applyInfo }, next) => {
      const { address, sourceChainMagic, dappid } = applyInfo;

      const memDapp = (await accountGetterHelper.getDApp(
        sourceChainMagic,
        dappid,
        currentBlockHeight,
      )) as BFChainCore.DAppInfo | undefined;
      if (!memDapp) {
        throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
          dappid,
          ...Function_Exception_Detail,
        });
      }
      if (memDapp.possessorAddress === address) {
        throw new ConsensusException(NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
          type: "dappid",
          asset: dappid,
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 注册链
    event.on("registerChain", async ({ applyInfo }, next) => {
      const { address, genesisBlock } = applyInfo;

      // 保证账户上足够的本链资产，避免 py 操作
      const {
        magic: chainMagic,
        assetType: chainAssetType,
        registerChainMinChainAsset,
      } = this.configHelper;
      const remainBalance =
        accountsAssets[address][chainMagic][chainAssetType].assetNumber - BigInt(transaction.fee);
      if (BigInt(registerChainMinChainAsset) > remainBalance) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `No enough asset, Min account asset ${registerChainMinChainAsset}, remain Assets: ${remainBalance}`,
          errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
          ...Function_Exception_Detail,
        });
      }

      // 是否持有除链资产外的其他资产
      this.isPossessAssetExceptForChainAsset(accountsAssets[address]);

      // 资产的发行账户不能是dapp的拥有者
      const memDApp = await accountGetterHelper.getDApp(chainMagic, "", currentBlockHeight, {
        address,
      });
      if (memDApp) {
        throw new ConsensusException(ACCOUNT_CAN_NOT_BE_FROZEN, {
          address,
          reason: "DApp id possessor can not initiate a register chain transaction",
          errorId: NewTransactionRefuseReason.DAPP_POSSESSOR_CAN_NOT_REGISTER_CHAIN,
          ...Function_Exception_Detail,
        });
      }

      // 资产的发行账户不能是链域名的拥有者账户或管理账户
      const memLocationName = await accountGetterHelper.getLocationName(
        chainMagic,
        "",
        currentBlockHeight,
        {
          address,
        },
      );
      if (memLocationName) {
        throw new ConsensusException(ACCOUNT_CAN_NOT_BE_FROZEN, {
          address,
          reason:
            "Location name possessor or manager can not initiate a register chain transaction",
          errorId: NewTransactionRefuseReason.LNS_POSSESSOR_OR_MANAGER_CAN_NOT_REGISTER_CHAIN,
          ...Function_Exception_Detail,
        });
      }

      // 链上是否已经存在这个链的创世块
      const magic = genesisBlock.remark.magic;
      const memchain = await accountGetterHelper.getChain(magic);
      if (memchain) {
        throw new ConsensusException(ALREADY_EXIST, {
          prop: `Chain with magic ${magic}}`,
          target: "blockChain",
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 注册链域名
    event.on("registerLocationName", async ({ applyInfo }, next) => {
      const { sourceChainMagic, name } = applyInfo;

      // 已存在的域名不能重复添加
      const memLocation = (await accountGetterHelper.getLocationName(
        sourceChainMagic,
        name,
        currentBlockHeight,
      )) as BFChainCore.LocationNameInfo | undefined;
      if (memLocation) {
        throw new ConsensusException(ALREADY_EXIST, {
          prop: name,
          target: "blockChain",
          errorId: NewTransactionRefuseReason.LOCATION_NAME_ALREADY_EXIST,
          ...Function_Exception_Detail,
        });
      }

      // 链域名是否被禁用
      const result = await accountGetterHelper.isLocationNameForbidden(name);
      if (result) {
        throw new ConsensusException(FORBIDDEN, {
          prop: `Location name ${name}`,
          target: "blockChain",
          ...Function_Exception_Detail,
        });
      }

      const names = name.split(".");
      if (names.length > 2) {
        // 不能越级添加域名，即上级域名不存在则添加失败
        const index = name.indexOf(".") + 1;
        const lastLocationName = name.substr(index);
        const lastMemLocation = await accountGetterHelper.getLocationName(
          sourceChainMagic,
          lastLocationName,
          currentBlockHeight,
        );
        if (!lastMemLocation) {
          throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
            locationName: lastLocationName,
            ...Function_Exception_Detail,
          });
        }
      }

      next();
    });

    // 注销链域名
    event.on("cancelLocationName", async ({ applyInfo }, next) => {
      const { sourceChainMagic, name } = applyInfo;

      const names = name.split(".");
      // 顶级域名不能删除
      if (names.length === 2) {
        throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
          locationName: name,
          reason: "Top level location name can not be delete",
          ...Function_Exception_Detail,
        });
      }

      // 不存在的域名不能删除
      const memLocation = (await accountGetterHelper.getLocationName(
        sourceChainMagic,
        name,
        currentBlockHeight,
      )) as BFChainCore.LocationNameInfo | undefined;
      if (!memLocation) {
        throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
          locationName: name,
          errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          ...Function_Exception_Detail,
        });
      }

      // 冻结状态的域名不能删除
      if (memLocation.status === ASSET_STATUS.FROZEN) {
        throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
          locationName: name,
          reason: "Frozen location name can not be delete",
          ...Function_Exception_Detail,
        });
      }

      // 只有域名的拥有者才能删除域名
      if (memLocation.possessorAddress !== transaction.senderId) {
        throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
          locationName: name,
          reason: "Only location name possessor can delete location name",
          ...Function_Exception_Detail,
        });
      }

      // 不能越级删除域名，即有子域名的域名不能删除
      const exist = await accountGetterHelper.getLocationName(
        sourceChainMagic,
        name,
        currentBlockHeight,
        {
          endsWith: name,
        },
      );
      if (exist) {
        throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
          locationName: name,
          reason: "Location name have child location name, please delete it at first",
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 设置链域名管理员
    event.on("setLnsManager", async ({ applyInfo }, next) => {
      const { address, sourceChainMagic, name, manager } = applyInfo;

      // 不能将冻结账户设置为管理员
      const newManager = await accountGetterHelper.getAccountInfo(manager);
      if (newManager) {
        const accountStatus = newManager.accountStatus;
        if (
          accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
          accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
          accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
        ) {
          throw new ConsensusException(ACCOUNT_FROZEN, {
            address: manager,
            errorId: NewTransactionRefuseReason.CAN_NOT_SET_FROZEN_ACCOUNT_AS_MANAGER,
            ...Function_Exception_Detail,
          });
        }
      }

      // 链域名不存在不能设置管理员
      const memLocation = (await accountGetterHelper.getLocationName(
        sourceChainMagic,
        name,
        currentBlockHeight,
      )) as BFChainCore.LocationNameInfo | undefined;
      if (!memLocation) {
        throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
          locationName: name,
          ...Function_Exception_Detail,
        });
      }

      // 处于冻结状态的链域名不能设置管理员
      if (memLocation.status === ASSET_STATUS.FROZEN) {
        throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
          locationName: name,
          reason: "Frozen location name can not set manager",
          ...Function_Exception_Detail,
        });
      }

      // 不能将原来的管理员设置为管理员
      if (manager === memLocation.manager) {
        throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
          locationName: name,
          reason: "Can not set the same account as manager",
          errorId: NewTransactionRefuseReason.CAN_NOT_SET_SAME_ACCOUNT_AS_MANAGER,
          ...Function_Exception_Detail,
        });
      }

      if (memLocation.level === LOCATION_NAME_LEVEL.MULTI_LEVEL) {
        const names = name.split(".");
        const index = names[0].length + 1;
        const lastLocationName = name.substr(index);
        const lastMemLocation = (await accountGetterHelper.getLocationName(
          sourceChainMagic,
          lastLocationName,
          currentBlockHeight,
        )) as BFChainCore.LocationNameInfo | undefined;
        // 上级域名不存在
        if (!lastMemLocation) {
          throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
            locationName: lastLocationName,
            reason: "Last location name is not exists",
            ...Function_Exception_Detail,
          });
        }

        // 多级域名只有域名的拥有者或者上级域名的管理员可以设置管理员
        if (!(address === memLocation.possessorAddress || address === lastMemLocation.manager)) {
          throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
            locationName: lastLocationName,
            reason:
              "Only the location name possessor or upper level location name manager can set manager of multi level location name",
            ...Function_Exception_Detail,
          });
        }
      } else {
        // 顶级域名只有域名的拥有者可以设置管理员
        if (address !== memLocation.possessorAddress) {
          throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
            locationName: name,
            reason: "Only the location name possessor can set manager of top level location name",
            ...Function_Exception_Detail,
          });
        }
      }

      next();
    });

    // 设置链域名解析值
    event.on("setLnsRecordValue", async ({ applyInfo }, next) => {
      const { address, sourceChainMagic, name, operationType, addRecord, deleteRecord } = applyInfo;

      // 校验当前域名是否存存在
      const memLocation = (await accountGetterHelper.getLocationName(
        sourceChainMagic,
        name.toLowerCase(),
        currentBlockHeight,
      )) as BFChainCore.LocationNameInfo | undefined;
      if (!memLocation) {
        throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
          locationName: name,
          errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          ...Function_Exception_Detail,
        });
      }

      const { records, status } = memLocation;
      // 处于冻结状态的链域名不能设置解析值
      if (status === ASSET_STATUS.FROZEN) {
        throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
          locationName: name,
          reason: "Frozen location name can not set record value",
          ...Function_Exception_Detail,
        });
      }

      // 只有域名的拥有者或者管理员可以设置域名的解析值
      if (!(address === memLocation.possessorAddress || address === memLocation.manager)) {
        throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
          locationName: name,
          reason: "Only the location name possessor or manager can set record value",
          ...Function_Exception_Detail,
        });
      }

      if (operationType === RECORD_OPERATION_TYPE.ADD) {
        if (!addRecord) {
          throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
            locationName: name,
            reason: "New location name record value lose",
            ...Function_Exception_Detail,
          });
        }
        this.addRecord(name, addRecord, records);
      } else if (operationType === RECORD_OPERATION_TYPE.DELETE) {
        if (!deleteRecord) {
          throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
            locationName: name,
            reason: "Delete location name record value lose",
            ...Function_Exception_Detail,
          });
        }
        this.deleteRecord(name, deleteRecord, records);
      } else if (operationType === RECORD_OPERATION_TYPE.UPDATE) {
        if (!(addRecord && deleteRecord)) {
          throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
            locationName: name,
            reason: "New location name record value and delete location name record value lose",
            ...Function_Exception_Detail,
          });
        }
        this.deleteRecord(name, deleteRecord, records);
        this.addRecord(name, addRecord, records);
      }

      next();
    });

    // 出售链域名
    event.on("saleLocationName", async ({ applyInfo }, next) => {
      const { address, sourceChainMagic, name } = applyInfo;

      // 域名是否存在
      const memLocation = (await accountGetterHelper.getLocationName(
        sourceChainMagic,
        name,
        currentBlockHeight,
      )) as BFChainCore.LocationNameInfo | undefined;
      if (!memLocation) {
        throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
          locationName: name,
          errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          ...Function_Exception_Detail,
        });
      }
      if (memLocation.possessorAddress !== address) {
        throw new ConsensusException(ACCOUNT_NOT_LOCATION_NAME_POSSESSOR, {
          address,
          locationName: name,
          errorId: NewTransactionRefuseReason.ACCOUNT_NOT_LNS_POSSESSOR,
          ...Function_Exception_Detail,
        });
      }
      if (memLocation.status === ASSET_STATUS.FROZEN) {
        throw new ConsensusException(LOCATION_NAME_ALREADY_FROZEN, {
          locationName: name,
          ...Function_Exception_Detail,
        });
      }
      // 只有顶级域名能交换
      if (memLocation.level !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
        throw new ConsensusException(ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE, {
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 购买链域名，链域名解冻，更换拥有者
    event.on("purchaseLocationName", async ({ applyInfo }, next) => {
      const { address, sourceChainMagic, name } = applyInfo;

      // 域名是否存在
      const memLocation = (await accountGetterHelper.getLocationName(
        sourceChainMagic,
        name,
        currentBlockHeight,
      )) as BFChainCore.LocationNameInfo | undefined;
      if (!memLocation) {
        throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
          locationName: name,
          errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          ...Function_Exception_Detail,
        });
      }
      if (memLocation.possessorAddress === address) {
        throw new ConsensusException(NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
          type: "locationName",
          asset: name,
          ...Function_Exception_Detail,
        });
      }
      // 只有顶级域名能交换
      if (memLocation.level !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
        throw new ConsensusException(ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE, {
          ...Function_Exception_Detail,
        });
      }

      next();
    });

    // 注册事件错误处理器
    event.onError((err, { eventname, arg }) => {
      throw err;
    });

    await this.transactionCore
      .getTransactionFactoryFromType(transaction.type)
      .applyTransaction(transaction, event);

    return trsFee;
  }
}

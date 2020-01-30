import { Inject, QueneEventEmitter } from "@bfchain/util";
import { ConfigHelper, ChainTimeHelper, BlockHelper, JSBIHelper } from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_FOUND,
  PROP_LOSE,
  ACCOUNT_FROZEN,
  TRANSACTION_SENDER_SECOND_PUBLICKEY_IS_REQUIRED,
  TRANSACTION_SIGN_SIGNATURE_IS_REQUIRED,
  SECOND_PUBLICKEY_ALREADY_CHANGE,
  SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY,
  TRANSACTION_SHOULD_NOT_HAVE_SIGN_SIGNATURE,
  INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT,
  INVALID_TRANSACTION_TO_MAGIC,
  INVALID_TRANSACTION_TIMESTAMP,
  DAPPID_IS_NOT_EXIST,
  LOCATION_NAME_IS_NOT_EXIST,
  UNKNOWN_RANGE_TYPE,
  ASSET_NOT_ENOUGH,
  EQUITY_NOT_ENOUGH,
  INVALID_TRANSACTION_BYTE_LENGTH,
  NEED_PURCHASE_DAPPID_BEFORE_USE,
  NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE,
  POSSESS_ASSET_EXCEPT_CHAIN_ASSET,
  TRANSACTION_FEE_NOT_ENOUGH,
  ALREADY_EXIST,
} from "@bfchain/core-util-exception";
import {
  NewTransactionRefuseReason,
  Transaction,
  RANGE_TYPE,
  DAPP_TYPE,
  ACCOUNT_STATUS,
} from "@bfchain/core-model";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "TransactionLogicVerifier",
);

export abstract class TransactionLogicVerifier<T extends Transaction<any> = Transaction<any>> {
  @Inject(ConfigHelper)
  protected configHelper!: ConfigHelper;
  @Inject(ChainTimeHelper)
  protected timeHelper!: ChainTimeHelper;
  @Inject(BlockHelper)
  protected blockHelper!: BlockHelper;
  @Inject(JSBIHelper)
  protected jsbiHelper!: JSBIHelper;
  @Inject("bfchain-core:TransactionCore")
  protected transactionCore!: import("@bfchain/core-transaction").TransactionCore;
  @Inject("transactionGetterHelper", { optional: true, dynamics: true })
  protected transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface;
  @Inject("accountGetterHelper", { optional: true, dynamics: true })
  protected accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any>;
  @Inject("customTransactionCenter", { optional: true, dynamics: true })
  customTransactionCenter?: BFChainCore.CustomTrCenterInterface;
  abstract verify(
    transaction: T,
    currentBlockHeight: number,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any>,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
    customTransactionCenter?: BFChainCore.CustomTrCenterInterface,
  ): Promise<boolean>;

  async logicVerify(
    transaction: T,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "logicVerify",
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
    const { senderId, recipientId, senderPublicKey } = transaction;
    // 获取账户信息和资产信息
    const sender = await accountGetterHelper.getAccountInfoAndAssets(senderId);
    if (!(sender && sender.accountInfo && sender.accountAssets)) {
      throw new NoFoundException(NOT_FOUND, {
        prop: "sender",
        ...Function_Exception_Detail,
      });
    }
    const senderAccountInfo = sender.accountInfo;
    // 初始化账户公钥
    if (!senderAccountInfo.publicKey) {
      const address = senderAccountInfo.address;
      await accountGetterHelper.initAccountPublicKey(address, senderPublicKey, currentBlockHeight);
      senderAccountInfo.publicKey = senderPublicKey;
    }
    // 校验发起账户状态
    this.checkSenderAccountStatus(senderAccountInfo);
    // 检验二次密码
    this.checkSecondPublicKey(senderAccountInfo, transaction);
    // 校验交易的发起高度
    this.checkApplyBlockHeight(transaction, currentBlockHeight);
    // 校验交易的 magic
    await this.checkTransactionMagic(transaction, accountGetterHelper);
    // 校验交易的时间戳
    this.checkTransactionTimestamp(transaction);
    // 校验交易的接收范围
    await this.checkTransactionRange(transaction, currentBlockHeight, accountGetterHelper);
    // 校验交易的接收账户状态
    let recipient: BFChainCore.AccountInfoAndAssets | undefined;
    if (recipientId) {
      recipient = await accountGetterHelper.getAccountInfoAndAssets(recipientId);
      if (recipient && recipient.accountInfo && recipient.accountAssets) {
        this.checkRecipientAccountStatus(recipient.accountInfo);
      }
    }
    // 校验账户资产是否充足
    await this.checkAccountAssetsEnough(transaction, sender, recipient, currentBlockHeight);
    // 校验交易的最大字节数
    this.checkTrsMaxBytes(transaction.getBytes().length);
    // 校验交易的 dappid
    await this.checkDAppId(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    // 校验交易的 lns
    await this.checkLocationName(transaction, currentBlockHeight, accountGetterHelper);

    return sender;
  }

  /**
   * 校验发起账户状态
   *
   * @param accountInfo
   */
  checkSenderAccountStatus(accountInfo: BFChainCore.AccountInfo | undefined) {
    const Function_Exception_Detail = {
      function: "checkSenderAccountStatus",
    } as const;
    if (!(accountInfo && accountInfo.hasOwnProperty("accountStatus"))) {
      throw new ConsensusException(PROP_LOSE, {
        prop: "accountStatus",
        target: "accountInfo",
        ...Function_Exception_Detail,
      });
    }
    if (
      accountInfo.accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
      accountInfo.accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
    ) {
      throw new ConsensusException(ACCOUNT_FROZEN, {
        address: accountInfo.address,
        errorId: NewTransactionRefuseReason.TRANSACTION_SENDER_ASSET_FROZEN,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验接收账户的状态
   *
   * @param accountInfo
   */
  checkRecipientAccountStatus(accountInfo: BFChainCore.AccountInfo | undefined) {
    const Function_Exception_Detail = {
      function: "checkRecipientAccountStatus",
    } as const;
    if (!(accountInfo && accountInfo.hasOwnProperty("accountStatus"))) {
      throw new ConsensusException(PROP_LOSE, {
        prop: "accountStatus",
        target: "accountInfo",
        ...Function_Exception_Detail,
      });
    }
    if (
      accountInfo.accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
      accountInfo.accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
    ) {
      throw new ConsensusException(ACCOUNT_FROZEN, {
        address: accountInfo.address,
        errorId: NewTransactionRefuseReason.TRANSACTION_RECIPIENT_ASSET_FROZEN,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验二次密码
   *
   * @param accountInfo
   * @param tr
   */
  checkSecondPublicKey(accountInfo: BFChainCore.AccountInfo, tr: T) {
    const Function_Exception_Detail = {
      function: "checkSecondPublicKey",
    } as const;
    if (accountInfo.secondPublicKey) {
      if (!tr.senderSecondPublicKey) {
        throw new ConsensusException(TRANSACTION_SENDER_SECOND_PUBLICKEY_IS_REQUIRED, {
          id: tr.id,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }

      if (!tr.signSignature) {
        throw new ConsensusException(TRANSACTION_SIGN_SIGNATURE_IS_REQUIRED, {
          id: tr.id,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }

      if (accountInfo.secondPublicKey !== tr.senderSecondPublicKey) {
        throw new ConsensusException(SECOND_PUBLICKEY_ALREADY_CHANGE, {
          id: tr.id,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }
    } else {
      if (tr.senderSecondPublicKey) {
        throw new ConsensusException(SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY, {
          id: tr.id,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }
      if (tr.signSignature) {
        throw new ConsensusException(TRANSACTION_SHOULD_NOT_HAVE_SIGN_SIGNATURE, {
          id: tr.id,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 校验交易的发起高度是否已经大于最大区块间隔
   *
   * @param tr
   * @param currentBlockHeight
   */
  checkApplyBlockHeight(tr: T, currentBlockHeight: number) {
    const Function_Exception_Detail = {
      function: "checkApplyBlockHeight",
    } as const;
    const trsApplyHeight = tr.applyBlockHeight;
    if (trsApplyHeight > currentBlockHeight) {
      throw new ConsensusException(INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT, {
        reason: "must less than currnt block height",
        ...Function_Exception_Detail,
      });
    }
    const diffHeight = currentBlockHeight - trsApplyHeight;
    const maxApplyAndConfirmedBlockHeightDiff = this.configHelper
      .maxApplyAndConfirmedBlockHeightDiff;
    const numberOfEffectiveBlocks = tr.numberOfEffectiveBlocks;
    if (numberOfEffectiveBlocks > maxApplyAndConfirmedBlockHeightDiff) {
      throw new ConsensusException(INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT, {
        reason: "must less than maxApplyAndConfirmedBlockHeightDiff",
        ...Function_Exception_Detail,
      });
    }
    if (diffHeight > numberOfEffectiveBlocks) {
      throw new ConsensusException(INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT, {
        reason: `Transaction apply block height ${trsApplyHeight}, current block height ${currentBlockHeight}, number of effective blocks ${numberOfEffectiveBlocks}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验 fromMagic、toMagic
   *
   * @param tr
   */
  async checkTransactionMagic(tr: T, accountGetterHelper = this.accountGetterHelper) {
    const Function_Exception_Detail = {
      function: "checkTransactionMagic",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_FOUND, {
        prop: "accountGetterHelper",
        ...Function_Exception_Detail,
      });
    }
    const fromMagic = tr.fromMagic;
    const toMagic = tr.toMagic;
    const chainMagic = this.configHelper.magic;
    const parentGenesisBlock = this.configHelper.parentGenesisBlock;
    const parentMagic = (parentGenesisBlock && parentGenesisBlock.remark.magic) || chainMagic;
    if (fromMagic === chainMagic) {
      // 来自本链的交易
      if (toMagic === chainMagic) {
        return;
      }
      // 去往他链的交易
      if (parentMagic === chainMagic) {
        // 当前链是父链，去往的子链必须存在
        const subchain = await accountGetterHelper.getSubchain(toMagic);
        if (!subchain) {
          throw new ConsensusException(INVALID_TRANSACTION_TO_MAGIC, {
            reason: "Transaction toMagic subchain not exists",
            id: tr.id,
            senderId: tr.senderId,
            applyBlockHeight: tr.applyBlockHeight,
            type: tr.type,
            ...Function_Exception_Detail,
          });
        }
      } else {
        // 当前链是子链，必须是去往父链的交易
        if (toMagic !== parentMagic) {
          throw new ConsensusException(INVALID_TRANSACTION_TO_MAGIC, {
            reason: "Transaction toMagic must be local magic or parent magic",
            id: tr.id,
            senderId: tr.senderId,
            applyBlockHeight: tr.applyBlockHeight,
            type: tr.type,
            ...Function_Exception_Detail,
          });
        }
      }
    } else {
      // 来自外链的交易
      if (parentMagic !== chainMagic) {
        // 当前是子链，必须是来自父链的交易
        if (fromMagic !== parentMagic) {
          throw new ConsensusException(INVALID_TRANSACTION_TO_MAGIC, {
            reason: "Transaction fromMagic must be parent",
            id: tr.id,
            senderId: tr.senderId,
            applyBlockHeight: tr.applyBlockHeight,
            type: tr.type,
            ...Function_Exception_Detail,
          });
        }
      } else {
        // 当前链是主链，来自的子链必须存在
        const subchain = await accountGetterHelper.getSubchain(fromMagic);
        if (!subchain) {
          throw new ConsensusException(INVALID_TRANSACTION_TO_MAGIC, {
            reason: "Transaction fromMagic subchain not exists",
            id: tr.id,
            senderId: tr.senderId,
            applyBlockHeight: tr.applyBlockHeight,
            type: tr.type,
            ...Function_Exception_Detail,
          });
        }
      }
      // 必须是去往本链的交易
      if (toMagic !== chainMagic) {
        throw new ConsensusException(INVALID_TRANSACTION_TO_MAGIC, {
          reason: "Transaction to magic must be local",
          id: tr.id,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 校验交易的时间戳
   *
   * @param tr
   */
  checkTransactionTimestamp(tr: T) {
    const { timeHelper } = this;
    if (timeHelper.getSlotNumberByTimestamp(tr.timestamp) > timeHelper.getSlotNumberByTimestamp()) {
      throw new ConsensusException(INVALID_TRANSACTION_TIMESTAMP, {
        reason:
          "Transaction timestamp in future. Transaction time is ahead of the time on the server",
        id: tr.id,
        senderId: tr.senderId,
        applyBlockHeight: tr.applyBlockHeight,
        type: tr.type,
        function: "checkTransactionTimestamp",
      });
    }
  }

  /**
   * 校验交易的接收范围
   *
   * @param tr
   * @param currentBlockHeight
   * @param accountGetterHelper
   */
  async checkTransactionRange(
    tr: T,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "checkTransactionRange",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const { rangeType, range } = tr;
    if (rangeType === RANGE_TYPE.EMPTY) {
      return;
    }
    const { magic } = this.configHelper;
    switch (rangeType) {
      case RANGE_TYPE.MULTI_ADDRESS:
        for (const address of range) {
          const accountInfo = await accountGetterHelper.getAccountInfo(address);
          if (accountInfo) {
            this.checkRecipientAccountStatus(accountInfo);
          }
        }
        break;
      case RANGE_TYPE.MULTI_DAPPID:
        for (const dappid of range) {
          // FIXME: dappid 全是本链的
          const memDapp = await accountGetterHelper.getDApp(magic, dappid, currentBlockHeight);
          if (!memDapp) {
            throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
              dappid,
              ...Function_Exception_Detail,
            });
          }
        }
        break;
      case RANGE_TYPE.MULTI_LOCATION_NAME:
        for (const lns of range) {
          const memLocationName = await accountGetterHelper.getLocationName(
            magic,
            lns,
            currentBlockHeight,
          );
          if (!memLocationName) {
            throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
              locationName: lns,
              ...Function_Exception_Detail,
            });
          }
        }
        break;
      default:
        throw new ConsensusException(UNKNOWN_RANGE_TYPE, {
          rangeType,
          ...Function_Exception_Detail,
        });
    }
  }

  private deepClone<T>(obj: T): T {
    let result = Array.isArray(obj) ? ([] as any) : ({} as T);
    if (typeof obj === "object") {
      for (let key in obj) {
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
   * 校验账户资产是否充足
   *
   * @param tr
   * @param sender
   * @param recipient
   * @param currentBlockHeight
   */
  async checkAccountAssetsEnough(
    tr: T,
    sender: BFChainCore.AccountInfoAndAssets,
    recipient: BFChainCore.AccountInfoAndAssets | undefined,
    currentBlockHeight: number,
  ) {
    const Function_Exception_Detail = {
      function: "checkAccountAssetsEnough",
    } as const;
    const accountAssets = {
      [tr.senderId]: this.deepClone(sender.accountAssets),
    };
    const accountInfo = {
      [tr.senderId]: this.deepClone(sender.accountInfo),
    };
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      accountAssets[address] = this.deepClone(recipient.accountAssets);
      accountInfo[address] = this.deepClone(recipient.accountInfo);
    }

    const event = new QueneEventEmitter<BFChainCore.ApplyTransactionEventMap>();
    // 交易的总手续费
    let trsFee = BigInt(0);
    // 这里不做设置账户用名、注册受托人，开启/关闭投票，设置二次密码，销毁资产等校验
    // 因为自定义交易可能对这些数据有不同的处理逻辑，所以只在每种交易自己的 verify 中
    // 校验。

    //注册事件错误处理器
    event.onError((err, { eventname, arg }) => {
      throw err;
    });
    // 扣除交易的手续费
    event.on("fee", ({ applyInfo }, next) => {
      // 手续费扣除的只能是链资产
      const { magic, assetType } = this.configHelper;
      const fee = BigInt(applyInfo.amount);
      const address = applyInfo.address;
      accountAssets[address] = accountAssets[address] || {};
      accountAssets[address][magic] = accountAssets[address][magic] || {};
      accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
        sourceChainMagic: magic,
        assetType: assetType,
        assetNumber: BigInt(0),
        history: {},
      };
      const hodingAsset = accountAssets[address][magic][assetType];
      const remainAsset = hodingAsset.assetNumber;
      hodingAsset.assetNumber += fee;
      trsFee += fee;
      if (hodingAsset.assetNumber < BigInt(0)) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `Transaction id: ${tr.id} address: ${address} magic ${
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

    // 扣除交易的资产数量
    event.on("asset", ({ applyInfo }, next) => {
      const { magic, assetType } = applyInfo.assetInfo;
      const address = applyInfo.address;
      accountAssets[address] = accountAssets[address] || {};
      accountAssets[address][magic] = accountAssets[address][magic] || {};
      accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
        sourceChainMagic: magic,
        assetType: assetType,
        assetNumber: BigInt(0),
        history: {},
      };
      const hodingAsset = accountAssets[address][magic][assetType];
      const remainAsset = hodingAsset.assetNumber;
      hodingAsset.assetNumber += BigInt(applyInfo.amount);
      if (hodingAsset.assetNumber < BigInt(0)) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `Transaction id: ${tr.id} address: ${address} magic ${
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

    // 冻结交易的资产数量
    event.on("frozenAsset", async ({ applyInfo }, next) => {
      const { magic, assetType } = applyInfo.assetInfo;
      const address = applyInfo.address;
      accountAssets[address] = accountAssets[address] || {};
      accountAssets[address][magic] = accountAssets[address][magic] || {};
      accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
        sourceChainMagic: magic,
        assetType: assetType,
        assetNumber: BigInt(0),
        history: {},
      };
      const hodingAsset = accountAssets[address][magic][assetType];
      const remainAsset = hodingAsset.assetNumber;
      hodingAsset.assetNumber += BigInt(applyInfo.amount);
      if (hodingAsset.assetNumber < BigInt(0)) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `Transaction id: ${tr.id} address: ${address} magic ${
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

    // 这里不监听 unfrozenAsset 事件，因为每种涉及冻结资产的逻辑校验不一致
    // 在每种交易各自 verify 的时候做。

    event.on("voteEquity", ({ applyInfo }, next) => {
      const round = this.blockHelper.calcRoundByHeight(currentBlockHeight) - 1;
      const address = applyInfo.address;
      accountInfo[address] = accountInfo[address] || {};
      const equityInfo = accountInfo[address].equityInfo;
      const minEquity = BigInt(0);
      let accountEquity = equityInfo.round === round ? equityInfo.equity : minEquity;
      const remainEquity = accountEquity;
      accountEquity += BigInt(applyInfo.equity);
      if (accountEquity < minEquity) {
        throw new ConsensusException(EQUITY_NOT_ENOUGH, {
          reason: `Transaction id: ${
            tr.id
          } address: ${address} hodingEquity: ${remainEquity.toString()} spendEquity: ${
            applyInfo.equity
          }`,
          ...Function_Exception_Detail,
        });
      }
      next();
    });
    await this.transactionCore.getTransactionFactoryFromType(tr.type).applyTransaction(tr, event);
    return trsFee;
  }

  /**
   * 校验交易的最大字节数
   *
   * @param trs
   * @param byteLength
   */
  checkTrsMaxBytes(byteLength: number) {
    if (BigInt(byteLength) > BigInt(this.configHelper.maxTransactionSize)) {
      throw new ConsensusException(INVALID_TRANSACTION_BYTE_LENGTH, {
        reason: "The size of the transaction exceeds the limit",
        function: "checkTrsMaxBytes",
      });
    }
  }

  /**
   * 校验 dappid
   *
   * @param trs
   * @param currentBlockHeight
   */
  async checkDAppId(
    trs: T,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "checkDAppId",
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
    const { dappid, senderId } = trs;
    if (!dappid) {
      return;
    }
    const dapp = (await accountGetterHelper.getDApp(
      trs.fromMagic,
      dappid,
      currentBlockHeight,
    )) as BFChainCore.DAppInfo;
    if (!dapp) {
      throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
        dappid,
        ...Function_Exception_Detail,
      });
    }
    if (dapp.type === DAPP_TYPE.PAID_APP) {
      // FIXME: 付费一次永久生效
      const isPurchase = await transactionGetterHelper.getPurchaseDApp(senderId, dappid);
      if (!isPurchase) {
        throw new ConsensusException(NEED_PURCHASE_DAPPID_BEFORE_USE, {
          dappid,
          ...Function_Exception_Detail,
        });
      }
    }
    if (trs.type === this.transactionCore.transactionHelper.VOTE) {
      return;
    }
    // 获取dapp开发账户
    const accountInfo = await accountGetterHelper.getAccountInfo(dapp.possessorAddress);
    if (!accountInfo) {
      throw new ConsensusException(NOT_FOUND, {
        porp: "Dapp possessor",
        ...Function_Exception_Detail,
      });
    }
    if (accountInfo.isAcceptVote) {
      const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);
      // 判断当前账户是否给 dapp 开发者投过票
      const isVote = await accountGetterHelper.getVoteForDelegate(
        senderId,
        dapp.possessorAddress,
        dappid,
        curRound,
      );
      if (!isVote) {
        throw new ConsensusException(NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE, {
          dappid,
          errorId: NewTransactionRefuseReason.MUSET_VOTE_FOR_DAPP_POSSESSOR,
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 校验 location name
   *
   * @param tr
   * @param currentBlockHeight
   */
  async checkLocationName(
    tr: T,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "checkLocationName",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const lns = tr.lns;
    if (!lns) {
      return;
    }
    const memLns = await accountGetterHelper.getLocationName(
      this.configHelper.magic,
      lns,
      currentBlockHeight,
    );
    if (!memLns) {
      throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
        locationName: lns,
        errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 账户是否持有除链资产外其他资产
   *
   * @param assets
   */
  isPossessAssetExceptForChainAsset(assets: BFChainCore.AccountAssets) {
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

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   */
  checkTrsFeeAndWebFee(transaction: BFChainCore.Transaction, byteLength: number) {
    const { jsbiHelper, transactionCore, configHelper } = this;
    if (transaction.type === transactionCore.transactionHelper.GRAB_ASSET) {
      return transaction.fee;
    }
    const feePerByte = {
      numerator: BigInt(transaction.fee),
      denominator: byteLength,
    };
    const minTransactionFeePerByte = configHelper.minTransactionFeePerByte;
    const result = jsbiHelper.compareFraction(feePerByte, minTransactionFeePerByte);
    const minFee = jsbiHelper.multiplyCeilFraction(byteLength, minTransactionFeePerByte).toString();
    if (result < 0) {
      throw new ConsensusException(TRANSACTION_FEE_NOT_ENOUGH, {
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
        minFee: minFee,
        function: "checkTrsFeeAndWebFee",
      });
    }
    return minFee;
  }

  /**
   * 检验交易的手续费是否大于等于矿机手续费
   *
   * @param transaction
   */
  checkTrsFeeAndMiningMachineFee(
    transaction: BFChainCore.Transaction,
    byteLength: number,
    minFeePerByte: BFChainCore.FractionJSON,
  ) {
    const { jsbiHelper, transactionCore } = this;
    if (transaction.type === transactionCore.transactionHelper.GRAB_ASSET) {
      return transaction.fee;
    }
    const feePerByte = {
      numerator: BigInt(transaction.fee),
      denominator: byteLength,
    };
    const result = jsbiHelper.compareFraction(feePerByte, minFeePerByte);
    const minFee = jsbiHelper.multiplyCeilFraction(byteLength, minFeePerByte).toString();
    if (result < 0) {
      throw new ConsensusException(TRANSACTION_FEE_NOT_ENOUGH, {
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
        minFee: minFee,
        function: "checkTrsFeeAndMiningMachineFee",
      });
    }
    return minFee;
  }

  /**
   * 查询交易是否已经在未处理交易中
   *
   * @param senderId
   * @param id
   */
  async checkRepeatInUntreatedTransaction(
    senderId: string,
    id: string,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "checkRepeatInUntreatedTransaction",
    } as const;
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const result = await transactionGetterHelper.checkRepeatInUntreatedTransaction(senderId, id);
    if (result) {
      throw new ConsensusException(ALREADY_EXIST, {
        prop: `Transaction with id ${id}`,
        target: "untreated transaction",
        ...Function_Exception_Detail,
      });
    }
  }
  /**
   * 查询交易是否已经在链上
   *
   * @param senderId
   * @param id
   */
  async checkRepeatInBlockChainTransaction(
    id: string,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "checkRepeatInBlockChainTransaction",
    } as const;
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const result = await transactionGetterHelper.checkRepeatInBlockChainTransaction(id);
    if (result) {
      throw new ConsensusException(ALREADY_EXIST, {
        prop: `Transaction with id ${id}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 不能二次操作同一笔交易(红包/资产交换/委托资产)
   *
   * @param tr
   */
  async checkSecondaryTransaction(
    transaction: T,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    return;
  }
}

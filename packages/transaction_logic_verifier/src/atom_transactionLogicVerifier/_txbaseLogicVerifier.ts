import { Inject, parseHexToArrayBuffer } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_FOUND,
  PROP_LOSE,
  ACCOUNT_FROZEN,
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
  INVALID_TRANSACTION_BYTE_LENGTH,
  NEED_PURCHASE_DAPPID_BEFORE_USE,
  NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE,
  ALREADY_EXIST,
  INVALID_TRANSACTION_EFFECTIVE_BLOCK_HEIGHT,
  VERIFY_TRANSACTION_POW_OF_WORK_ERROR,
} from "@bfchain/core-util-exception";
import {
  NewTransactionRefuseReason,
  Transaction,
  RANGE_TYPE,
  DAPP_TYPE,
  ACCOUNT_STATUS,
} from "@bfchain/core-model";
import { EventLogicVerifier } from "./eventLogicVerifier";
import {
  ConfigHelper,
  ChainTimeHelper,
  BlockHelper,
  JSBIHelper,
  TransactionHelper,
} from "@bfchain/core-helper";
import { HelperLogicVerifier } from "./helperLogicVerifier";

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
  @Inject(TransactionHelper)
  protected transactionHelper!: TransactionHelper;
  @Inject(JSBIHelper)
  protected jsbiHelper!: JSBIHelper;
  @Inject(EventLogicVerifier)
  protected eventLogicVerifier!: EventLogicVerifier;
  @Inject(HelperLogicVerifier)
  protected helperLogicVerifier!: HelperLogicVerifier;
  @Inject("customTransactionCenter", { optional: true, dynamics: true })
  customTransactionCenter?: BFChainCore.CustomTrCenterInterface;
  abstract verify(
    transaction: T,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
    customTransactionCenter?: BFChainCore.CustomTrCenterInterface,
  ): Promise<boolean>;

  async logicVerify(
    transaction: T,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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
    const { recipientId, senderPublicKey } = transaction;
    // 获取账户信息和资产信息
    const sender = accountsInfo.sender;
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
    // 检验交易的有效高度
    this.checkEffectiveBlockHeight(transaction, currentBlockHeight);
    // 校验交易的 magic
    await this.checkTransactionMagic(transaction, accountGetterHelper);
    // 校验交易的时间戳
    this.checkTransactionTimestamp(transaction);
    // 校验交易的接收范围
    await this.checkTransactionRange(transaction, currentBlockHeight, accountGetterHelper);
    // 校验交易的接收账户状态
    let recipient: BFChainCore.AccountInfoAndAssets | undefined;
    if (recipientId) {
      recipient = accountsInfo.recipient;
      if (!recipient) {
        recipient = await accountGetterHelper.getAccountInfoAndAssets(recipientId);
      }
      if (recipient && recipient.accountInfo && recipient.accountAssets) {
        this.checkRecipientAccountStatus(recipient.accountInfo);
      }
    }
    // 事件逻辑校验
    await this.eventLogicVerifier.eventLogicVerifier(
      transaction,
      sender,
      recipient,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
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

    // 校验 pow
    if (currentBlockHeight > this.configHelper.powOfWorkExemptionBlocks) {
      await this.checkTransactionPowOfWork(
        transaction,
        currentBlockHeight,
        senderAccountInfo.fixedEquityInfo,
        accountGetterHelper,
      );
    }

    return { sender, recipient };
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
      if (!(tr.senderSecondPublicKey && tr.signSignature)) {
        throw new ConsensusException(TRANSACTION_SIGN_SIGNATURE_IS_REQUIRED, {
          signature: tr.signature,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }

      if (accountInfo.secondPublicKey !== tr.senderSecondPublicKey) {
        throw new ConsensusException(SECOND_PUBLICKEY_ALREADY_CHANGE, {
          signature: tr.signature,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }
    } else {
      if (tr.senderSecondPublicKey) {
        throw new ConsensusException(SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY, {
          signature: tr.signature,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }
      if (tr.signSignature) {
        throw new ConsensusException(TRANSACTION_SHOULD_NOT_HAVE_SIGN_SIGNATURE, {
          signature: tr.signature,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 校验交易的发起高度是否小于等于当前区块高度
   *
   * @param tr
   * @param currentBlockHeight
   */
  checkApplyBlockHeight(tr: T, currentBlockHeight: number) {
    const Function_Exception_Detail = {
      function: "checkApplyBlockHeight",
    } as const;
    const applyBlockHeight = tr.applyBlockHeight;
    if (applyBlockHeight > currentBlockHeight) {
      throw new ConsensusException(INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT, {
        reason: `applyBlockHeight ${applyBlockHeight} must less than currntBlockHeight ${currentBlockHeight}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验交易的发起高度是否大于等于当前区块高度
   *
   * @param tr
   * @param currentBlockHeight
   */
  checkEffectiveBlockHeight(tr: T, currentBlockHeight: number) {
    const Function_Exception_Detail = {
      function: "checkEffectiveBlockHeight",
    } as const;
    const effectiveBlockHeight = tr.effectiveBlockHeight;
    if (effectiveBlockHeight < currentBlockHeight) {
      throw new ConsensusException(INVALID_TRANSACTION_EFFECTIVE_BLOCK_HEIGHT, {
        reason: `effectiveBlockHeight ${tr.effectiveBlockHeight} must greate than or equal to currntBlockHeight ${currentBlockHeight}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验 fromMagic、toMagic
   *
   * @param tr
   */
  async checkTransactionMagic(
    tr: T,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
  ) {
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
    if (fromMagic === chainMagic) {
      // 来自本链的交易
      // 去往本链的交易
      if (toMagic === chainMagic) {
        return;
      }

      // 去往的注册链的交易, 去往的链必须已经在链上注册过
      const chain = await accountGetterHelper.getChain(toMagic);
      if (!chain) {
        throw new ConsensusException(INVALID_TRANSACTION_TO_MAGIC, {
          reason: "Transaction toMagic chain not exists",
          signature: tr.signature,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }
    } else {
      // 来自外链的交易
      // 来自的外链必须已经在链上注册过
      const chain = await accountGetterHelper.getChain(fromMagic);
      if (!chain) {
        throw new ConsensusException(INVALID_TRANSACTION_TO_MAGIC, {
          reason: "Transaction fromMagic chain not exists",
          signature: tr.signature,
          senderId: tr.senderId,
          applyBlockHeight: tr.applyBlockHeight,
          type: tr.type,
          ...Function_Exception_Detail,
        });
      }

      // 必须是去往本链
      if (toMagic !== chainMagic) {
        throw new ConsensusException(INVALID_TRANSACTION_TO_MAGIC, {
          reason: "Transaction to magic must be local",
          signature: tr.signature,
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
    const nowTimestamp = timeHelper.getTimestamp();
    const trsSlot = timeHelper.getSlotNumberByTimestamp(tr.timestamp);
    const nowSlot = timeHelper.getSlotNumberByTimestamp(nowTimestamp);
    if (trsSlot > nowSlot) {
      throw new ConsensusException(INVALID_TRANSACTION_TIMESTAMP, {
        reason: `Transaction timestamp in future. Transaction time is ahead of the time on the server, transaction timestamp ${tr.timestamp}, transaction timestamp slot ${trsSlot}, blockChain now timestamp ${nowTimestamp}, blockChain now timestamp slot ${nowSlot}`,
        signature: tr.signature,
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
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
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
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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
    // 获取dapp开发账户
    const accountInfo = await accountGetterHelper.getAccountInfo(dapp.possessorAddress);
    if (!accountInfo) {
      throw new ConsensusException(NOT_FOUND, {
        porp: "Dapp possessor",
        ...Function_Exception_Detail,
      });
    }
    // dapp 的拥有者不需要购买使用
    if (dapp.type === DAPP_TYPE.PAID_APP && senderId !== dapp.possessorAddress) {
      // FIXME: 付费一次永久生效
      const isPurchase = await transactionGetterHelper.getPurchaseDApp(senderId, dappid);
      if (!isPurchase) {
        throw new ConsensusException(NEED_PURCHASE_DAPPID_BEFORE_USE, {
          dappid,
          ...Function_Exception_Detail,
        });
      }
    }
    // dapp 的拥有者不需要投票使用
    if (accountInfo.isAcceptVote && senderId !== dapp.possessorAddress) {
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
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
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
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: BFChainCore.Transaction, byteLength: number) {
    if (transaction.type === this.transactionHelper.GRAB_ASSET) {
      return {
        isFeeEnough: true,
        minFee: transaction.fee,
      };
    }
    let realByteLength = byteLength;
    const feePerByte = {
      numerator: BigInt(transaction.fee),
      denominator: realByteLength,
    };
    // 红包交易需要付出 可抢次数+1 的最大交易体手续费
    if (transaction.type === this.transactionHelper.GIFT_ASSET) {
      const totalGrabTime = (transaction as BFChainCore.Transaction<BFChainCore.GiftAssetAssetJSON>)
        .asset.giftAsset.totalGrabableTimes;
      realByteLength = this.configHelper.maxTransactionSize * (totalGrabTime + 1);
      feePerByte.denominator = realByteLength;
    }
    const minTransactionFeePerByte = this.configHelper.minTransactionFeePerByte;
    const result = this.jsbiHelper.compareFraction(feePerByte, minTransactionFeePerByte);
    let minFee = this.jsbiHelper
      .multiplyCeilFraction(realByteLength, minTransactionFeePerByte)
      .toString();
    if (result < 0) {
      if (minFee.length !== transaction.fee.length) {
        minFee = this.jsbiHelper
          .multiplyCeilFraction(realByteLength + minFee.length, minTransactionFeePerByte)
          .toString();
      }
      return {
        isFeeEnough: false,
        minFee,
      };
    }
    return {
      isFeeEnough: true,
      minFee,
    };
  }

  /**
   * 检验交易的手续费是否大于等于矿机手续费和网络手续费
   *
   * @param transaction
   * @param byteLength
   * @param miningMachineMinFeePerByte
   */
  checkTrsFeeAndMiningMachineFeeAndWebFee(
    transaction: BFChainCore.Transaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    if (transaction.type === this.transactionHelper.GRAB_ASSET) {
      return {
        isFeeEnough: true,
        minFee: transaction.fee,
      };
    }
    let realByteLength = byteLength;
    const feePerByte = {
      numerator: BigInt(transaction.fee),
      denominator: realByteLength,
    };
    // 红包交易需要付出 可抢次数+1 的最大交易体手续费
    if (transaction.type === this.transactionHelper.GIFT_ASSET) {
      const totalGrabTime = (transaction as BFChainCore.Transaction<BFChainCore.GiftAssetAssetJSON>)
        .asset.giftAsset.totalGrabableTimes;
      realByteLength = this.configHelper.maxTransactionSize * (totalGrabTime + 1);
      feePerByte.denominator = realByteLength;
    }
    // 是否使用矿机手续费
    const useWebFee =
      this.jsbiHelper.compareFraction(
        this.configHelper.minTransactionFeePerByte,
        miningMachineMinFeePerByte,
      ) >= 0
        ? true
        : false;
    let standardFee = useWebFee
      ? this.configHelper.minTransactionFeePerByte
      : miningMachineMinFeePerByte;

    const result = this.jsbiHelper.compareFraction(feePerByte, standardFee);
    let minFee = this.jsbiHelper.multiplyCeilFraction(realByteLength, standardFee).toString();
    if (result < 0) {
      if (minFee.length !== transaction.fee.length) {
        minFee = this.jsbiHelper
          .multiplyCeilFraction(realByteLength + minFee.length, standardFee)
          .toString();
      }
      return {
        isFeeEnough: false,
        minFee,
      };
    }
    return {
      isFeeEnough: true,
      minFee,
    };
  }

  /**
   * 查询交易是否已经在未处理交易中
   *
   * @param senderId
   * @param signature
   */
  async checkRepeatInUntreatedTransaction(
    senderId: string,
    signature: string,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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
    const result = await transactionGetterHelper.checkRepeatInUntreatedTransaction(
      senderId,
      signature,
    );
    if (result) {
      throw new ConsensusException(ALREADY_EXIST, {
        prop: `Transaction with signature ${signature}`,
        target: "untreated transaction",
        ...Function_Exception_Detail,
      });
    }
  }
  /**
   * 查询交易是否已经在链上
   *
   * @param senderId
   * @param signature
   */
  async checkRepeatInBlockChainTransaction(
    signature: string,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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
    const result = await transactionGetterHelper.checkRepeatInBlockChainTransaction(signature);
    if (result) {
      throw new ConsensusException(ALREADY_EXIST, {
        prop: `Transaction with signature ${signature}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验交易的 pow
   *
   * @param transaction
   * @param currentBlockHeight
   * @param fixedEquityInfo
   * @param accountGetterHelper
   */
  async checkTransactionPowOfWork(
    transaction: T,
    currentBlockHeight: number,
    fixedEquityInfo: {
      round: number;
      equity: bigint;
    },
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "checkRepeatInBlockChainTransaction",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);
    const tranSenderCount = await accountGetterHelper.getAccountTxCountInBlock(
      transaction.senderId,
    );
    if (tranSenderCount === undefined) {
      throw new ConsensusException(NOT_FOUND, {
        prop: "account number of transaction in block",
        ...Function_Exception_Detail,
      });
    }
    const senderEquity =
      fixedEquityInfo.round === curRound - 1 ? fixedEquityInfo.equity.toString() : "0";
    const powCheckResult = await this.transactionHelper.checkTransactionProfOfWork(
      parseHexToArrayBuffer(transaction.signature),
      tranSenderCount,
      senderEquity,
    );
    if (!powCheckResult) {
      throw new ConsensusException(
        VERIFY_TRANSACTION_POW_OF_WORK_ERROR,
        `Transaction pow check field, block height ${currentBlockHeight} transaction signature ${transaction.signature} sender ${transaction.senderId} senderEquity ${senderEquity} sender transaction count in block ${tranSenderCount}`,
      );
    }
  }

  /**
   * 不能二次操作同一笔交易(资产赠送/资产交换/特殊资产交换/委托资产/资产迁入)
   *
   * @param tr
   */
  async checkSecondaryTransaction(
    transaction: T,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ) {
    return;
  }
}

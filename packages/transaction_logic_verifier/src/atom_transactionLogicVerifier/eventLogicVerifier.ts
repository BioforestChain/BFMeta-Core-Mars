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
  CAN_NOT_DELETE_LOCATION_NAME,
  SET_LOCATION_NAME_MANAGER_FIELD,
  SET_LOCATION_NAME_RECORD_VALUE_FIELD,
  UNFROZEN_TIME_USE_UP,
  REGISTER_DELEGTE_QUOTA_FULL,
  NOT_MATCH,
  REJECT_REGISTER_DELEGATE,
  SHOULD_BE,
} from "@bfchain/core-util-exception";
import {
  NewTransactionRefuseReason,
  ACCOUNT_STATUS,
  ASSET_STATUS,
  LOCATION_NAME_LEVEL,
  RECORD_OPERATION_TYPE,
} from "@bfchain/core-model";
import { ConfigHelper, BlockHelper, TransactionHelper } from "@bfchain/core-helper";
import { HelperLogicVerifier } from "./helperLogicVerifier";

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
  @Inject(HelperLogicVerifier)
  protected helperLogicVerifier!: HelperLogicVerifier;
  @Inject("bfchain-core:TransactionCore")
  protected transactionCore!: import("@bfchain/core-transaction").TransactionCore;

  private __event: BFChainCore.ApplyTransactionEventEmitter | undefined;

  get event() {
    if (!this.__event) {
      this.__event = new QueneEventEmitter();
    }
    return this.__event;
  }

  private destoryEvent() {
    this.__event = undefined;
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

  listenEventFee(
    accountsAssets: { [asddress: string]: BFChainCore.AccountAssets },
    transaction: BFChainCore.Transaction,
  ) {
    const Function_Exception_Detail = {
      function: "listenEventFee",
    } as const;

    // 扣除手续费
    this.event.on(
      "fee",
      ({ applyInfo }, next) => {
        // 手续费扣除的只能是链资产
        const { magic, assetType } = this.configHelper;
        if (magic !== this.configHelper.magic) {
          throw new ConsensusException(SHOULD_BE, {
            to_compare_prop: "magic",
            to_target: "applyInfo",
            be_compare_prop: this.configHelper.magic,
            ...Function_Exception_Detail,
          });
        }
        if (assetType !== this.configHelper.assetType) {
          throw new ConsensusException(SHOULD_BE, {
            to_compare_prop: "assetType",
            to_target: "applyInfo",
            be_compare_prop: this.configHelper.assetType,
            ...Function_Exception_Detail,
          });
        }
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
      },
      { taskname: `applyTransaction/logicVerifier/fee` },
    );
  }

  listenEventAsset(
    accountsAssets: { [asddress: string]: BFChainCore.AccountAssets },
    transaction: BFChainCore.Transaction,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 扣除资产
    this.event.on(
      "asset",
      ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/asset` },
    );
  }

  listenEventFrozenAsset(
    accountsAssets: { [asddress: string]: BFChainCore.AccountAssets },
    transaction: BFChainCore.Transaction,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 冻结资产
    this.event.on(
      "frozenAsset",
      async ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/frozenAsset` },
    );
  }

  listenEventUnfrozenAsset(
    transaction: BFChainCore.Transaction,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 解冻资产
    this.event.on(
      "unfrozenAsset",
      async ({ applyInfo }, next) => {
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
          blockSignature,
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
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenAsset` },
    );
  }

  listenEventVoteEquity(
    accountsInfo: { [address: string]: BFChainCore.AccountInfo },
    transaction: BFChainCore.Transaction,
    curRound: number,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 扣除权益
    this.event.on(
      "voteEquity",
      ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/voteEquity` },
    );
  }

  listenEventFrozenAccount(accountsInfo: { [address: string]: BFChainCore.AccountInfo }) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 冻结账户
    this.event.on(
      "frozenAccount",
      ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/frozenAccount` },
    );
  }

  listenEventSetUsername(accountGetterHelper: BFChainCore.AccountGetterHelperInterface) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 设置用户名
    this.event.on(
      "setUsername",
      async ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/setUsername` },
    );
  }

  listenEventSetSecondPublicKey() {
    // 设置二次密码
    this.event.on(
      "setSecondPublicKey",
      ({ applyInfo }, next) => {
        next();
      },
      { taskname: `applyTransaction/logicVerifier/setSecondPublicKey` },
    );
  }

  listenEventRegisterToDelegate(
    accountsInfo: { [address: string]: BFChainCore.AccountInfo },
    curRound: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    // 注册成为受托人
    this.event.on(
      "registerToDelegate",
      async ({ applyInfo }, next) => {
        if (this.configHelper.maxDelegateTxsPerRound === 0) {
          throw new ConsensusException(REJECT_REGISTER_DELEGATE, {
            reason: `every round can only deal ${this.configHelper.maxDelegateTxsPerRound} delegate transaction, reject receive delegate transaction`,
            ...Function_Exception_Detail,
          });
        }

        const { address } = applyInfo;
        accountsInfo[address] = accountsInfo[address] || {};
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

        let realMaxDelegateTxsPerRound = maxDelegateTxsPerRound;
        if (curRound === 1) {
          realMaxDelegateTxsPerRound = realMaxDelegateTxsPerRound + this.configHelper.delegates;
        }
        if (txCount >= realMaxDelegateTxsPerRound) {
          throw new ConsensusException(REGISTER_DELEGTE_QUOTA_FULL, {
            round: curRound,
            ...Function_Exception_Detail,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/registerToDelegate` },
    );
  }

  listenEventAcceptVote(accountsInfo: { [address: string]: BFChainCore.AccountInfo }) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 开启接收投票
    this.event.on(
      "acceptVote",
      ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/acceptVote` },
    );
  }

  listenEventRejectVote(accountsInfo: { [address: string]: BFChainCore.AccountInfo }) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 关闭接收投票
    this.event.on(
      "rejectVote",
      ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/rejectVote` },
    );
  }

  listenEventIssueAsset(
    accountsAssets: { [asddress: string]: BFChainCore.AccountAssets },
    transaction: BFChainCore.Transaction,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 发行数字资产
    this.event.on(
      "issueAsset",
      async ({ applyInfo }, next) => {
        const { address, assetType, genesisAddress, expectedIssuedAssets } = applyInfo;

        // 是否持有除链资产外的其他资产
        this.helperLogicVerifier.isPossessAssetExceptForChainAsset(accountsAssets[address]);

        // 资产的发行账户不能是dapp的拥有者
        await this.helperLogicVerifier.isDAppPossessor(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // 资产的发行账户不能是链域名的拥有者账户或管理账户
        await this.helperLogicVerifier.isLnsPossessorOrManager(
          address,
          this.configHelper,
          accountGetterHelper,
        );

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
          BigInt(remainChainAsset) *
          BigInt(this.configHelper.chainAssetAndDigitalAssetExchangeRate);
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
      },
      { taskname: `applyTransaction/logicVerifier/issueAsset` },
    );
  }

  listenEventDestoryAsset(
    transaction: BFChainCore.Transaction,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 资产销毁
    this.event.on(
      "destoryAsset",
      async ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/destoryAsset` },
    );
  }

  listenEventIssueDAppid(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 发行 dapid
    this.event.on(
      "issueDAppid",
      async ({ applyInfo }, next) => {
        const { dappid, sourceChainMagic, purchaseAsset, possessorAddress } = applyInfo;

        // 不能将冻结账户设置为 dapp 的拥有者
        // const possessor = await accountGetterHelper.getAccountInfo(possessorAddress);
        // if (possessor) {
        //   const accountStatus = possessor.accountStatus;
        //   if (
        //     accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
        //     accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
        //     accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
        //   ) {
        //     throw new ConsensusException(ACCOUNT_FROZEN, {
        //       address: possessorAddress,
        //       ...Function_Exception_Detail,
        //     });
        //   }
        // }

        // 用于购买的资产是否合法
        if (purchaseAsset) {
          const { sourceChainMagic: magic, sourceChainName, assetType, amount } = purchaseAsset;
          const memAsset = await accountGetterHelper.getAsset(magic, assetType);
          if (!memAsset) {
            throw new ConsensusException(ASSET_NOT_EXIST, {
              magic,
              assetType,
              ...Function_Exception_Detail,
            });
          }

          if (magic !== this.configHelper.magic && assetType !== this.configHelper.assetType) {
            if (memAsset.remainAssets < BigInt(amount)) {
              throw new ConsensusException(ASSET_NOT_ENOUGH, {
                reason: `Purchase asset amount greater than remain assets, spend ${amount}, remain ${memAsset.remainAssets}`,
                errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
                ...Function_Exception_Detail,
              });
            }
          }

          if (memAsset.sourceChainName !== sourceChainName) {
            throw new ConsensusException(NOT_MATCH, {
              to_compare_prop: memAsset.sourceChainName,
              be_compare_prop: sourceChainName,
              to_target: "memAsset",
              be_target: "issueDAppid.applyInfo",
              ...Function_Exception_Detail,
            });
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
      },
      { taskname: `applyTransaction/logicVerifier/issueDAppid` },
    );
  }

  listenEventSaleDAppid(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 出售 dappid
    this.event.on(
      "saleDAppid",
      async ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/saleDAppid` },
    );
  }

  listenEventPurchaseDAppid(
    transaction: BFChainCore.Transaction,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 购买 dappid
    this.event.on(
      "purchaseDAppid",
      async ({ applyInfo }, next) => {
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
        if (transaction.recipientId !== memDapp.possessorAddress) {
          throw new ConsensusException(SHOULD_BE, {
            to_compare_prop: "recipientId",
            to_target: "transaction",
            be_compare_prop: "dapp possessor",
            ...Function_Exception_Detail,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/purchaseDAppid` },
    );
  }

  listenEventRegisterChain(
    accountsAssets: { [asddress: string]: BFChainCore.AccountAssets },
    transaction: BFChainCore.Transaction,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 注册链
    this.event.on(
      "registerChain",
      async ({ applyInfo }, next) => {
        const { address, genesisBlock } = applyInfo;

        // 是否持有除链资产外的其他资产
        this.helperLogicVerifier.isPossessAssetExceptForChainAsset(accountsAssets[address]);

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

        // 资产的发行账户不能是dapp的拥有者
        await this.helperLogicVerifier.isDAppPossessor(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // 资产的发行账户不能是链域名的拥有者账户或管理账户
        await this.helperLogicVerifier.isLnsPossessorOrManager(
          address,
          this.configHelper,
          accountGetterHelper,
        );

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
      },
      { taskname: `applyTransaction/logicVerifier/registerChain` },
    );
  }

  listenEventRegisterLocationName(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 注册链域名
    this.event.on(
      "registerLocationName",
      async ({ applyInfo }, next) => {
        const { sourceChainMagic, name, possessorAddress } = applyInfo;

        // 不能将冻结账户设置为 lns 的拥有者
        // const possessor = await accountGetterHelper.getAccountInfo(possessorAddress);
        // if (possessor) {
        //   const accountStatus = possessor.accountStatus;
        //   if (
        //     accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
        //     accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
        //     accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
        //   ) {
        //     throw new ConsensusException(ACCOUNT_FROZEN, {
        //       address: possessorAddress,
        //       ...Function_Exception_Detail,
        //     });
        //   }
        // }

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
      },
      { taskname: `applyTransaction/logicVerifier/registerLocationName` },
    );
  }

  listenEventCancelLocationName(
    transaction: BFChainCore.Transaction,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 注销链域名
    this.event.on(
      "cancelLocationName",
      async ({ applyInfo }, next) => {
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

        // 发起账户地址和接收账户地址必须是同一个
        // if (transaction.senderId !== transaction.recipientId) {
        //   throw new ConsensusException(SHOULD_BE, {
        //     to_compare_prop: `recipientId`,
        //     to_target: "transaction",
        //     be_compare_prop: transaction.senderId,
        //     ...Function_Exception_Detail,
        //   });
        // }

        // 只有域名的拥有者才能删除域名
        if (memLocation.possessorAddress !== transaction.senderId) {
          throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
            locationName: name,
            reason: "Only location name possessor can delete location name",
            ...Function_Exception_Detail,
          });
        }

        // 不能越级删除域名，即有子域名的域名不能删除
        const isSubLnsExist = await accountGetterHelper.isSubLocationNameExist(
          sourceChainMagic,
          name,
        );
        if (isSubLnsExist) {
          throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
            locationName: name,
            reason: "Location name have child location name, please delete it at first",
            ...Function_Exception_Detail,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/cancelLocationName` },
    );
  }

  listenEventSetLnsManager(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 设置链域名管理员
    this.event.on(
      "setLnsManager",
      async ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/setLnsManager` },
    );
  }

  listenEventSetLnsRecordValue(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 设置链域名解析值
    this.event.on(
      "setLnsRecordValue",
      async ({ applyInfo }, next) => {
        const {
          address,
          sourceChainMagic,
          name,
          operationType,
          addRecord,
          deleteRecord,
        } = applyInfo;

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
      },
      { taskname: `applyTransaction/logicVerifier/setLnsRecordValue` },
    );
  }

  listenEventSaleLocationName(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 出售链域名
    this.event.on(
      "saleLocationName",
      async ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/saleLocationName` },
    );
  }

  listenEventPurchaseLocationName(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "eventLogicVerifier",
    } as const;

    // 购买链域名，链域名解冻，更换拥有者
    this.event.on(
      "purchaseLocationName",
      async ({ applyInfo }, next) => {
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
      },
      { taskname: `applyTransaction/logicVerifier/purchaseLocationName` },
    );
  }

  /**
   * 捕捉事件异常
   *
   */
  private __catchEventError() {
    (this.event as QueneEventEmitter<BFChainUtil.EmitterEvents<typeof event>>).onError(
      (err, { eventname, arg }) => {
        this.destoryEvent();
        throw err;
      },
    );
  }

  /**
   * 等待事件处理结果
   *
   * @param transaction
   */
  async awaitEventResult(transaction: BFChainCore.Transaction) {
    this.__catchEventError();
    await this.transactionCore
      .getTransactionFactoryFromType(transaction.type)
      .applyTransaction(transaction, this.event);
    this.destoryEvent();
  }
}

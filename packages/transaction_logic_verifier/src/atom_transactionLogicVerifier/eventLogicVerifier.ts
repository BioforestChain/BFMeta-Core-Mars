import { Injectable, Inject, getHexFromArrayBuffer } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  NewTransactionRefuseReason,
  ACCOUNT_STATUS,
  ASSET_STATUS,
  LOCATION_NAME_LEVEL,
  RECORD_OPERATION_TYPE,
} from "@bfchain/core-model";
import { ConfigHelper, BlockHelper, TransactionHelper, JSBIHelper } from "@bfchain/core-helper";
import { HelperLogicVerifier } from "./helperLogicVerifier";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "EventLogicVerifier",
);

@Injectable()
export class EventLogicVerifier {
  @Inject(JSBIHelper)
  protected jsbiHelper!: JSBIHelper;
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

  private addRecord(
    locationName: string,
    addRecord: BFChainCore.LocationNameRecordJSON,
    records: BFChainCore.LocationNameRecordInfo,
  ) {
    const { recordType, recordValue } = addRecord;
    if (records && records[recordType] && records[recordType][recordValue]) {
      throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
        locationName,
        reason: "New location name record value already exist",
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
      throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
        locationName,
        reason: "Delete location name record value not exist",
      });
    }
  }

  listenEventFee(
    accountsAssets: { [asddress: string]: BFChainCore.AccountAssets },
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 扣除手续费
    eventEmitter.on(
      "fee",
      ({ transaction, applyInfo }, next) => {
        // 手续费扣除的只能是链资产
        const { magic, assetType } = this.configHelper;
        if (magic !== this.configHelper.magic) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `magic ${magic}`,
            to_target: "applyInfo",
            be_compare_prop: this.configHelper.magic,
          });
        }
        if (assetType !== this.configHelper.assetType) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `assetType ${assetType}`,
            to_target: "applyInfo",
            be_compare_prop: this.configHelper.assetType,
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
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `Transaction signature: ${transaction.signature} address: ${address} magic ${
              applyInfo.assetInfo.magic
            } assetType: ${
              applyInfo.assetInfo.assetType
            } hodingAsset: ${remainAsset.toString()} spendFee: ${applyInfo.amount}`,
            errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/fee` },
    );
  }

  listenEventAsset(
    accountsAssets: { [asddress: string]: BFChainCore.AccountAssets },
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 扣除资产
    eventEmitter.on(
      "asset",
      ({ transaction, applyInfo }, next) => {
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
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `Transaction signature: ${transaction.signature} address: ${address} magic ${
              applyInfo.assetInfo.magic
            } assetType: ${
              applyInfo.assetInfo.assetType
            } hodingAsset: ${remainAsset.toString()} spendAsset: ${applyInfo.amount}`,
            errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/asset` },
    );
  }

  listenEventFrozenAsset(
    accountsAssets: { [asddress: string]: BFChainCore.AccountAssets },
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结资产
    eventEmitter.on(
      "frozenAsset",
      async ({ transaction, applyInfo }, next) => {
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
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `Transaction signature: ${transaction.signature} address: ${address} magic ${
              applyInfo.assetInfo.magic
            } assetType: ${
              applyInfo.assetInfo.assetType
            } hodingAsset: ${remainAsset.toString()} frozenAsset: ${applyInfo.amount}`,
            errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenAsset` },
    );
  }

  listenEventUnfrozenAsset(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻资产
    eventEmitter.on(
      "unfrozenAsset",
      async ({ transaction, applyInfo }, next) => {
        const { assetInfo, frozenIdBuffer, amount: spendAsset, recipientId } = applyInfo;
        const { magic, assetType } = assetInfo;
        const transactionSignature = getHexFromArrayBuffer(frozenIdBuffer);

        // 获取冻结信息
        const frozenAsset = await accountGetterHelper.getFrozenAsset(
          recipientId,
          transactionSignature,
        );

        if (!frozenAsset) {
          throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
            prop: `Frozen asset with signature ${transactionSignature}`,
            target: "blockChain",
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
          throw new ConsensusException(ERROR_LIST.NOT_BEGIN_UNFROZEN_YET, {
            frozenId: transactionSignature,
          });
        }

        // 交易交易是否过期
        if (currentBlockHeight > maxEffectiveHeight) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_EXPIRATION, {
            frozenId: transactionSignature,
          });
        }

        if (maxEffectiveHeight < transaction.applyBlockHeight) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_EXPIRATION, {
            frozenId: transactionSignature,
          });
        }

        // 剩余资产是否足够
        if (BigInt(spendAsset) > BigInt(remainAsset)) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `No enough asset to unfrozen magic ${magic} assetType ${assetType} remain ${remainAsset} spend ${spendAsset}`,
          });
        }

        // 剩余解冻次数是否足够
        if (remainUnfrozenTimes !== undefined) {
          if (remainUnfrozenTimes === 0) {
            throw new ConsensusException(ERROR_LIST.UNFROZEN_TIME_USE_UP, {
              frozenId: transactionSignature,
            });
          }
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenAsset` },
    );
  }

  listenEventSignForAsset(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻资产
    eventEmitter.on(
      "signForAsset",
      async ({ transaction, applyInfo }, next) => {
        const { frozenIdBuffer, frozenAddress } = applyInfo;
        const transactionSignature = getHexFromArrayBuffer(frozenIdBuffer);

        // 获取冻结信息
        const frozenAsset = await accountGetterHelper.getFrozenAsset(
          frozenAddress,
          transactionSignature,
        );

        if (!frozenAsset) {
          throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
            prop: `Frozen asset with signature ${transactionSignature}`,
            target: "blockChain",
          });
        }

        const { maxEffectiveHeight, minEffectiveHeight, remainUnfrozenTimes, amount } = frozenAsset;
        // 是否到达解冻高度
        if (minEffectiveHeight > transaction.applyBlockHeight) {
          throw new ConsensusException(ERROR_LIST.NOT_BEGIN_UNFROZEN_YET, {
            frozenId: transactionSignature,
          });
        }

        // 交易交易是否过期
        if (currentBlockHeight > maxEffectiveHeight) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_EXPIRATION, {
            frozenId: transactionSignature,
          });
        }

        if (maxEffectiveHeight < transaction.applyBlockHeight) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_EXPIRATION, {
            frozenId: transactionSignature,
          });
        }

        // 剩余资产是否足够
        if (BigInt(amount) === BigInt(0)) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `No enough asset to sign for magic ${frozenAsset.sourceChainMagic} assetType ${frozenAsset.assetType} remain ${amount}`,
          });
        }

        // 剩余解冻次数是否足够
        if (remainUnfrozenTimes !== undefined) {
          if (remainUnfrozenTimes === 0) {
            throw new ConsensusException(ERROR_LIST.UNFROZEN_TIME_USE_UP, {
              frozenId: transactionSignature,
            });
          }
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/signForAsset` },
    );
  }

  listenEventVoteEquity(
    accountsInfo: { [address: string]: BFChainCore.AccountInfo },
    curRound: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 扣除权益
    eventEmitter.on(
      "voteEquity",
      ({ transaction, applyInfo }, next) => {
        const round = curRound - 1;
        const address = applyInfo.address;
        accountsInfo[address] = accountsInfo[address] || {};
        const equityInfo = accountsInfo[address].equityInfo;
        const minEquity = BigInt(0);
        let accountEquity = equityInfo.round === round ? equityInfo.equity : minEquity;
        const remainEquity = accountEquity;
        accountEquity += BigInt(applyInfo.equity);
        if (accountEquity < minEquity) {
          throw new ConsensusException(ERROR_LIST.ACCOUNT_REMAIN_EQUITY_NOT_ENOUGH, {
            errorId: NewTransactionRefuseReason.ACCOUNT_REMAIN_EQUITY_NOT_ENOUGH,
            reason: `Transaction signature: ${
              transaction.signature
            } address: ${address} hodingEquity: ${remainEquity.toString()} spendEquity: ${
              applyInfo.equity
            }`,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/voteEquity` },
    );
  }

  listenEventFrozenAccount(
    accountsInfo: { [address: string]: BFChainCore.AccountInfo },
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结账户
    eventEmitter.on(
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
          throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
            address,
            status: accountStatus,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenAccount` },
    );
  }

  listenEventSetUsername(
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 设置用户名
    eventEmitter.on(
      "setUsername",
      async ({ applyInfo }, next) => {
        const { address, alias } = applyInfo;
        // 这个不统一做
        // if (accountsInfo[address].username) {
        //   throw new ConsensusException(ERROR_LIST.ACCOUNT_ALREADY_HAVE_USERNAME, {
        //     errorId: NewTransactionRefuseReason.ACCOUNT_ALREADY_HAVE_USERNAME,
        //     ...Function_Exception_Detail,
        //   });
        // }

        const memUsername = await accountGetterHelper.getAlias(alias);
        if (memUsername) {
          throw new ConsensusException(ERROR_LIST.USERNAME_ALREADY_EXIST, {
            errorId: NewTransactionRefuseReason.USERNAME_ALREADY_EXIST,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/setUsername` },
    );
  }

  listenEventSetSecondPublicKey(eventEmitter: BFChainCore.ApplyTransactionEventEmitter) {
    // 设置二次密码
    eventEmitter.on(
      "setSecondPublicKey",
      ({ applyInfo }, next) => {
        next();
      },
      { taskname: `applyTransaction/logicVerifier/setSecondPublicKey` },
    );
  }

  listenEventRegisterToDelegate(
    accountsInfo: { [address: string]: BFChainCore.AccountInfo },
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 注册成为受托人
    eventEmitter.on(
      "registerToDelegate",
      async ({ applyInfo }, next) => {
        const { address } = applyInfo;
        accountsInfo[address] = accountsInfo[address] || {};
        if (accountsInfo[address].isDelegate) {
          throw new ConsensusException(ERROR_LIST.ACCOUNT_IS_ALREADY_AN_DELEGATE, {
            address,
            errorId: NewTransactionRefuseReason.ACCOUNT_ALREADY_DELEGATE,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/registerToDelegate` },
    );
  }

  listenEventAcceptVote(
    accountsInfo: { [address: string]: BFChainCore.AccountInfo },
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 开启接收投票
    eventEmitter.on(
      "acceptVote",
      ({ applyInfo }, next) => {
        const { address } = applyInfo;
        accountsInfo[address] = accountsInfo[address] || {};
        if (!accountsInfo[address].isDelegate) {
          throw new ConsensusException(ERROR_LIST.ACCOUNT_IS_NOT_AN_DELEGATE, {
            address,
            errorId: NewTransactionRefuseReason.ACCOUNT_IS_NOT_AN_DELEGATE,
          });
        }

        if (accountsInfo[address].isAcceptVote) {
          throw new ConsensusException(ERROR_LIST.DELEGATE_IS_ALREADY_ACCEPT_VOTE, {
            address,
            errorId: NewTransactionRefuseReason.DELEGATE_IS_ALREADY_ACCEPT_VOTE,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/acceptVote` },
    );
  }

  listenEventRejectVote(
    accountsInfo: { [address: string]: BFChainCore.AccountInfo },
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 关闭接收投票
    eventEmitter.on(
      "rejectVote",
      ({ applyInfo }, next) => {
        const { address } = applyInfo;
        accountsInfo[address] = accountsInfo[address] || {};
        if (!accountsInfo[address].isDelegate) {
          throw new ConsensusException(ERROR_LIST.ACCOUNT_IS_NOT_AN_DELEGATE, {
            address,
            errorId: NewTransactionRefuseReason.ACCOUNT_IS_NOT_AN_DELEGATE,
          });
        }

        if (!accountsInfo[address].isAcceptVote) {
          throw new ConsensusException(ERROR_LIST.DELEGATE_IS_ALREADY_REJECT_VOTE, {
            address,
            errorId: NewTransactionRefuseReason.DELEGATE_IS_ALREADY_REJECT_VOTE,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/rejectVote` },
    );
  }

  listenEventIssueAsset(
    accountAssets: BFChainCore.AccountAssets,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行数字资产
    eventEmitter.on(
      "issueAsset",
      async ({ transaction, applyInfo }, next) => {
        const { address, assetInfo, genesisAddress, sourceAmount } = applyInfo;
        const { assetType } = assetInfo;

        // 不能将冻结账户设置为数字资产的创世账户
        const possessor = await accountGetterHelper.getAccountInfo(genesisAddress);
        if (possessor) {
          const accountStatus = possessor.accountStatus;
          if (
            accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
            accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
            accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
          ) {
            throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
              address: genesisAddress,
              status: accountStatus,
            });
          }
        }

        // 是否持有除链资产外的其他资产
        await this.helperLogicVerifier.isPossessAssetExceptChainAsset(
          address,
          accountAssets,
          accountGetterHelper,
        );

        // 资产的发行账户不能是dapp的拥有者
        await this.helperLogicVerifier.isDAppPossessor(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // 资产的发行账户不能是位名的拥有者账户或管理账户
        await this.helperLogicVerifier.isLnsPossessorOrManager(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // 资产的发行账户不能是 entityFactory 拥有者
        await this.helperLogicVerifier.isEntityFactoryPossessor(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // 资产的发行账户不能是 entity 拥有者
        await this.helperLogicVerifier.isEntityPossessor(
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
          accountAssets[chainMagic][chainAssetType].assetNumber - BigInt(transaction.fee);
        if (BigInt(issueAssetMinChainAsset) > remainChainAsset) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `No enough asset, Min account asset ${issueAssetMinChainAsset}, remain Assets: ${remainChainAsset}`,
            errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
          });
        }

        // 验证最大发行数量
        const calcMaxAssets = this.jsbiHelper.multiplyFloorFraction(
          remainChainAsset,
          this.configHelper.maxMultipleOfAssetAndMainAsset,
        );
        if (BigInt(sourceAmount) > calcMaxAssets) {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
            prop: `expectedIssuedAssets ${sourceAmount}`,
            target: `issueAsset`,
            field: `calc max assets ${calcMaxAssets}`,
          });
        }

        // 验证资产名是否被禁用
        const result = await accountGetterHelper.isCurrencyForbidden(assetType);
        if (result) {
          throw new ConsensusException(ERROR_LIST.FORBIDDEN, {
            prop: `AssetType ${assetType}`,
            target: "blockChain",
          });
        }

        // 验证资产名是否已经存在
        const memLegalCurrency = await accountGetterHelper.getCurrency(assetType);
        if (memLegalCurrency) {
          throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
            prop: `AssetType ${assetType}`,
            target: "blockChain",
            errorId: NewTransactionRefuseReason.ASSETTYPE_ALREADY_EXIST,
          });
        }

        // 验证资产是否已经存在
        const memAssets = await accountGetterHelper.getAsset(chainMagic, assetType);
        if (memAssets) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_EXIST, {
            magic: chainMagic,
            assetType,
            errorId: NewTransactionRefuseReason.ASSET_ALREADY_EXIST,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/issueAsset` },
    );
  }

  listenEventDestoryAsset(
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 资产销毁
    eventEmitter.on(
      "destoryAsset",
      async ({ applyInfo }, next) => {
        next();
      },
      { taskname: `applyTransaction/logicVerifier/destoryAsset` },
    );
  }

  listenEventIssueDAppid(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行 dapid
    eventEmitter.on(
      "issueDAppid",
      async ({ applyInfo }, next) => {
        const { address, dappid, sourceChainMagic, possessorAddress } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为 dapp 的拥有者
          const possessor = await accountGetterHelper.getAccountInfo(possessorAddress);
          if (possessor) {
            const accountStatus = possessor.accountStatus;
            if (
              accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
              accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
              accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
            ) {
              throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
                address: possessorAddress,
                status: accountStatus,
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
          throw new ConsensusException(ERROR_LIST.DAPPID_IS_ALREADY_EXIST, {
            dappid,
            errorId: NewTransactionRefuseReason.DAPP_ALREADY_EXISTS,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/issueDAppid` },
    );
  }

  listenEventFrozenDAppid(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结 dappid
    eventEmitter.on(
      "frozenDAppid",
      async ({ applyInfo }, next) => {
        const { address, sourceChainMagic, dappid } = applyInfo;

        const memDapp = await accountGetterHelper.getDApp(
          sourceChainMagic,
          dappid,
          currentBlockHeight,
        );
        if (!memDapp) {
          throw new ConsensusException(ERROR_LIST.DAPPID_IS_NOT_EXIST, {
            dappid,
          });
        }
        if (memDapp.possessorAddress !== address) {
          throw new ConsensusException(ERROR_LIST.ACCOUNT_NOT_DAPPID_POSSESSOR, {
            address,
            dappid,
            errorId: NewTransactionRefuseReason.ACCOUNT_NOT_DAPPID_POSSESSOR,
          });
        }
        if (memDapp.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.DAPPID_ALREADY_FROZEN, {
            dappid,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenDAppid` },
    );
  }

  listenEventUnfrozenDAppid(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻 dappid
    eventEmitter.on(
      "unfrozenDAppid",
      async ({ transaction, applyInfo }, next) => {
        const { address, sourceChainMagic, dappid } = applyInfo;

        const memDapp = await accountGetterHelper.getDApp(
          sourceChainMagic,
          dappid,
          currentBlockHeight,
        );
        if (!memDapp) {
          throw new ConsensusException(ERROR_LIST.DAPPID_IS_NOT_EXIST, {
            dappid,
          });
        }
        if (memDapp.status !== ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.DAPPID_NOT_FROZEN, {
            dappid,
          });
        }
        // if (memDapp.possessorAddress === address) {
        //   throw new ConsensusException(ERROR_LIST.NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
        //     type: "dappid",
        //     asset: dappid,
        //   });
        // }
        if (transaction.recipientId !== memDapp.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `recipientId ${transaction.recipientId}`,
            to_target: "transaction",
            be_compare_prop: `dapp possessor ${memDapp.possessorAddress}`,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenDAppid` },
    );
  }

  listenEventChangeDAppidPossessor(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 更改 dappid 拥有者
    eventEmitter.on(
      "changeDAppidPossessor",
      async ({ transaction, applyInfo }, next) => {
        const { address, possessorAddress, sourceChainMagic, dappid } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为 dappid 的拥有者
          const possessor = await accountGetterHelper.getAccountInfo(possessorAddress);
          if (possessor) {
            const accountStatus = possessor.accountStatus;
            if (
              accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
              accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
              accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
            ) {
              throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
                address: possessorAddress,
                status: accountStatus,
              });
            }
          }
        }

        const memDapp = await accountGetterHelper.getDApp(
          sourceChainMagic,
          dappid,
          currentBlockHeight,
        );
        if (!memDapp) {
          throw new ConsensusException(ERROR_LIST.DAPPID_IS_NOT_EXIST, {
            dappid,
          });
        }
        // 处于冻结状态的 dappid 不能更改拥有者
        if (memDapp.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.DAPPID_ALREADY_FROZEN, {
            dappid,
          });
        }
        // dappid 的拥有者才能更改拥有者
        if (transaction.senderId !== memDapp.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `senderId ${transaction.senderId}`,
            to_target: "transaction",
            be_compare_prop: `dapp possessor ${memDapp.possessorAddress}`,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/changeDAppidPossessor` },
    );
  }

  listenEventRegisterChain(
    accountAssets: BFChainCore.AccountAssets,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 注册链
    eventEmitter.on(
      "registerChain",
      async ({ transaction, applyInfo }, next) => {
        const { address, genesisBlock } = applyInfo;

        // 是否持有除链资产外的其他资产
        await this.helperLogicVerifier.isPossessAssetExceptChainAsset(
          address,
          accountAssets,
          accountGetterHelper,
        );

        // 保证账户上足够的本链资产，避免 py 操作
        const {
          magic: chainMagic,
          assetType: chainAssetType,
          registerChainMinChainAsset,
        } = this.configHelper;
        const remainBalance =
          accountAssets[chainMagic][chainAssetType].assetNumber - BigInt(transaction.fee);
        if (BigInt(registerChainMinChainAsset) > remainBalance) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `No enough asset, Min account asset ${registerChainMinChainAsset}, remain Assets: ${remainBalance}`,
            errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
          });
        }

        // 资产的发行账户不能是dapp的拥有者
        await this.helperLogicVerifier.isDAppPossessor(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // 资产的发行账户不能是位名的拥有者账户或管理账户
        await this.helperLogicVerifier.isLnsPossessorOrManager(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // 注册链的发行账户不能是 entityFactory 拥有者
        await this.helperLogicVerifier.isEntityFactoryPossessor(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // 注册链的发行账户不能是 entity 拥有者
        await this.helperLogicVerifier.isEntityPossessor(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        const { magic, assetType, chainName } = genesisBlock;

        // 验证链网络标识符是否已经存在
        const memMagic = await accountGetterHelper.getMagic(magic);
        if (memMagic) {
          throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
            prop: `Magic ${magic}`,
            target: "blockChain",
            errorId: NewTransactionRefuseReason.MAGIC_ALREADY_EXIST,
          });
        }

        // 验证链名是否已经存在
        const memChainName = await accountGetterHelper.getCurrency(chainName);
        if (memChainName) {
          throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
            prop: `ChainName ${chainName}`,
            target: "blockChain",
            errorId: NewTransactionRefuseReason.CHAINNAME_ALREADY_EXIST,
          });
        }

        // 验证主权益名是否已经存在
        const memAssetType = await accountGetterHelper.getCurrency(assetType);
        if (memAssetType) {
          throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
            prop: `AssetType ${assetType}`,
            target: "blockChain",
            errorId: NewTransactionRefuseReason.ASSETTYPE_ALREADY_EXIST,
          });
        }

        // 链上是否已经存在这个链的创世块
        const memChain = await accountGetterHelper.getChain(magic);
        if (memChain) {
          throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
            prop: `Chain with magic ${magic}`,
            target: "blockChain",
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
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 注册位名
    eventEmitter.on(
      "registerLocationName",
      async ({ applyInfo }, next) => {
        const { address, sourceChainMagic, name, possessorAddress } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为 lns 的拥有者
          const possessor = await accountGetterHelper.getAccountInfo(possessorAddress);
          if (possessor) {
            const accountStatus = possessor.accountStatus;
            if (
              accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
              accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
              accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
            ) {
              throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
                address: possessorAddress,
                status: accountStatus,
              });
            }
          }
        }

        // 已存在的位名不能重复添加
        const memLocation = await accountGetterHelper.getLocationName(
          sourceChainMagic,
          name,
          currentBlockHeight,
        );
        if (memLocation) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_ALREADY_EXIST, {
            prop: name,
            target: "blockChain",
            errorId: NewTransactionRefuseReason.LOCATION_NAME_ALREADY_EXIST,
          });
        }

        // 位名是否被禁用
        const result = await accountGetterHelper.isLocationNameForbidden(name);
        if (result) {
          throw new ConsensusException(ERROR_LIST.FORBIDDEN, {
            prop: `Location name ${name}`,
            target: "blockChain",
          });
        }

        const names = name.split(".");
        if (names.length > 2) {
          // 不能越级添加位名，即上级位名不存在则添加失败
          const index = name.indexOf(".") + 1;
          const lastLocationName = name.substr(index);
          const lastMemLocation = await accountGetterHelper.getLocationName(
            sourceChainMagic,
            lastLocationName,
            currentBlockHeight,
          );
          if (!lastMemLocation) {
            throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_NOT_EXIST, {
              locationName: lastLocationName,
            });
          }
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/registerLocationName` },
    );
  }

  listenEventCancelLocationName(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 注销位名
    eventEmitter.on(
      "cancelLocationName",
      async ({ transaction, applyInfo }, next) => {
        const { sourceChainMagic, name } = applyInfo;

        // const names = name.split(".");
        // // 顶级位名不能删除
        // if (names.length === 2) {
        //   throw new ConsensusException(ERROR_LIST.CAN_NOT_DELETE_LOCATION_NAME, {
        //     locationName: name,
        //     reason: "Top level location name can not be delete",
        //   });
        // }

        // 不存在的位名不能删除
        const memLocation = await accountGetterHelper.getLocationName(
          sourceChainMagic,
          name,
          currentBlockHeight,
        );
        if (!memLocation) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_NOT_EXIST, {
            locationName: name,
            errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          });
        }

        // 冻结状态的位名不能删除
        if (memLocation.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DELETE_LOCATION_NAME, {
            locationName: name,
            reason: "Frozen location name can not be delete",
          });
        }

        // 发起账户地址和接收账户地址必须是同一个
        if (transaction.senderId !== transaction.recipientId) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `recipientId`,
            to_target: "transaction",
            be_compare_prop: transaction.senderId,
          });
        }

        // 只有位名的拥有者才能删除位名
        if (memLocation.possessorAddress !== transaction.senderId) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DELETE_LOCATION_NAME, {
            locationName: name,
            reason: "Only location name possessor can delete location name",
          });
        }

        // 不能越级删除位名，即有子位名的位名不能删除
        const isSubLnsExist = await accountGetterHelper.isSubLocationNameExist(
          sourceChainMagic,
          name,
        );
        if (isSubLnsExist) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DELETE_LOCATION_NAME, {
            locationName: name,
            reason: "Location name have child location name, please delete it at first",
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
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 设置位名管理员
    eventEmitter.on(
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
            throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
              address: manager,
              errorId: NewTransactionRefuseReason.CAN_NOT_SET_FROZEN_ACCOUNT_AS_MANAGER,
            });
          }
        }

        // 位名不存在不能设置管理员
        const memLocation = await accountGetterHelper.getLocationName(
          sourceChainMagic,
          name,
          currentBlockHeight,
        );
        if (!memLocation) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_NOT_EXIST, {
            locationName: name,
          });
        }

        // 处于冻结状态的位名不能设置管理员
        if (memLocation.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_MANAGER_FIELD, {
            locationName: name,
            reason: "Frozen location name can not set manager",
          });
        }

        // 不能将原来的管理员设置为管理员
        if (manager === memLocation.manager) {
          throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_MANAGER_FIELD, {
            locationName: name,
            reason: "Can not set the same account as manager",
            errorId: NewTransactionRefuseReason.CAN_NOT_SET_SAME_ACCOUNT_AS_MANAGER,
          });
        }

        if (memLocation.level === LOCATION_NAME_LEVEL.MULTI_LEVEL) {
          const names = name.split(".");
          const index = names[0].length + 1;
          const lastLocationName = name.substr(index);
          const lastMemLocation = await accountGetterHelper.getLocationName(
            sourceChainMagic,
            lastLocationName,
            currentBlockHeight,
          );
          // 上级位名不存在
          if (!lastMemLocation) {
            throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_MANAGER_FIELD, {
              locationName: lastLocationName,
              reason: "Last location name is not exists",
            });
          }

          // 多级位名只有位名的拥有者或者上级位名的管理员可以设置管理员
          if (!(address === memLocation.possessorAddress || address === lastMemLocation.manager)) {
            throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_MANAGER_FIELD, {
              locationName: lastLocationName,
              reason:
                "Only the location name possessor or upper level location name manager can set manager of multi level location name",
            });
          }
        } else {
          // 顶级位名只有位名的拥有者可以设置管理员
          if (address !== memLocation.possessorAddress) {
            throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_MANAGER_FIELD, {
              locationName: name,
              reason: "Only the location name possessor can set manager of top level location name",
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
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 设置位名解析值
    eventEmitter.on(
      "setLnsRecordValue",
      async ({ applyInfo }, next) => {
        const { address, sourceChainMagic, name, operationType, addRecord, deleteRecord } =
          applyInfo;

        // 校验当前位名是否存存在
        const memLocation = await accountGetterHelper.getLocationName(
          sourceChainMagic,
          name.toLowerCase(),
          currentBlockHeight,
        );
        if (!memLocation) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_NOT_EXIST, {
            locationName: name,
            errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          });
        }

        const { records, status } = memLocation;
        // 处于冻结状态的位名不能设置解析值
        if (status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
            locationName: name,
            reason: "Frozen location name can not set record value",
          });
        }

        // 只有位名的拥有者或者管理员可以设置位名的解析值
        if (!(address === memLocation.possessorAddress || address === memLocation.manager)) {
          throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
            locationName: name,
            reason: "Only the location name possessor or manager can set record value",
          });
        }

        if (operationType === RECORD_OPERATION_TYPE.ADD) {
          if (!addRecord) {
            throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
              locationName: name,
              reason: "New location name record value lose",
            });
          }
          this.addRecord(name, addRecord, records);
        } else if (operationType === RECORD_OPERATION_TYPE.DELETE) {
          if (!deleteRecord) {
            throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
              locationName: name,
              reason: "Delete location name record value lose",
            });
          }
          this.deleteRecord(name, deleteRecord, records);
        } else if (operationType === RECORD_OPERATION_TYPE.UPDATE) {
          if (!(addRecord && deleteRecord)) {
            throw new ConsensusException(ERROR_LIST.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
              locationName: name,
              reason: "New location name record value and delete location name record value lose",
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

  listenEventFrozenLocationName(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结位名
    eventEmitter.on(
      "frozenLocationName",
      async ({ applyInfo }, next) => {
        const { address, sourceChainMagic, name } = applyInfo;

        // 位名是否存在
        const memLocation = await accountGetterHelper.getLocationName(
          sourceChainMagic,
          name,
          currentBlockHeight,
        );
        if (!memLocation) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_NOT_EXIST, {
            locationName: name,
            errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          });
        }
        if (memLocation.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_ALREADY_FROZEN, {
            locationName: name,
          });
        }
        // 只有顶级位名能交换
        if (memLocation.level !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
          throw new ConsensusException(ERROR_LIST.ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE);
        }
        if (memLocation.possessorAddress !== address) {
          throw new ConsensusException(ERROR_LIST.ACCOUNT_NOT_LOCATION_NAME_POSSESSOR, {
            address,
            locationName: name,
            errorId: NewTransactionRefuseReason.ACCOUNT_NOT_LNS_POSSESSOR,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenLocationName` },
    );
  }

  listenEventUnfrozenLocationName(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻位名，更换拥有者
    eventEmitter.on(
      "unfrozenLocationName",
      async ({ transaction, applyInfo }, next) => {
        const { address, sourceChainMagic, name } = applyInfo;

        // 位名是否存在
        const memLocation = await accountGetterHelper.getLocationName(
          sourceChainMagic,
          name,
          currentBlockHeight,
        );
        if (!memLocation) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_NOT_EXIST, {
            locationName: name,
            errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          });
        }
        if (memLocation.status !== ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_NOT_FROZEN, {
            locationName: name,
          });
        }
        // 只有顶级位名能交换
        if (memLocation.level !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
          throw new ConsensusException(ERROR_LIST.ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE);
        }
        // if (memLocation.possessorAddress === address) {
        //   throw new ConsensusException(ERROR_LIST.NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
        //     type: "locationName",
        //     asset: name,
        //   });
        // }
        if (transaction.recipientId !== memLocation.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `recipientId ${transaction.recipientId}`,
            to_target: "transaction",
            be_compare_prop: `locationName possessor ${memLocation.possessorAddress}`,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenLocationName` },
    );
  }

  listenEventChangeLocationNamePossessor(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 更改位名的拥有者
    eventEmitter.on(
      "changeLocationNamePossessor",
      async ({ transaction, applyInfo }, next) => {
        const { address, possessorAddress, sourceChainMagic, name } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为链域名的拥有者
          const possessor = await accountGetterHelper.getAccountInfo(possessorAddress);
          if (possessor) {
            const accountStatus = possessor.accountStatus;
            if (
              accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
              accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
              accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
            ) {
              throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
                address: possessorAddress,
                status: accountStatus,
              });
            }
          }
        }

        // 位名是否存在
        const memLocation = await accountGetterHelper.getLocationName(
          sourceChainMagic,
          name,
          currentBlockHeight,
        );
        if (!memLocation) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_NOT_EXIST, {
            locationName: name,
            errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          });
        }
        // 只有顶级位名才能更改拥有者
        if (memLocation.level !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
          throw new ConsensusException(ERROR_LIST.ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE);
        }
        // 处于冻结状态的位名不能更改拥有者
        if (memLocation.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_ALREADY_FROZEN, {
            locationName: name,
          });
        }
        // 位名的拥有者才能更改拥有者
        if (transaction.senderId !== memLocation.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `senderId ${transaction.senderId}`,
            to_target: "transaction",
            be_compare_prop: `locationName possessor ${memLocation.possessorAddress}`,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/changeLocationNamePossessor` },
    );
  }

  listenEventIssueEntityFactory(
    accountAssets: BFChainCore.AccountAssets,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行 entityFactory
    eventEmitter.on(
      "issueEntityFactory",
      async ({ transaction, applyInfo }, next) => {
        const { address, factoryId, sourceChainMagic, possessorAddress, numberOfEntities } =
          applyInfo;

        // 不能将冻结账户设置为数字资产的创世账户
        const possessor = await accountGetterHelper.getAccountInfo(possessorAddress);
        if (possessor) {
          const accountStatus = possessor.accountStatus;
          if (
            accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
            accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
            accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
          ) {
            throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
              address: possessorAddress,
              status: accountStatus,
            });
          }
        }

        // 是否持有除链资产外的其他资产
        await this.helperLogicVerifier.isPossessAssetExceptChainAsset(
          address,
          accountAssets,
          accountGetterHelper,
        );

        // entityFactory 的发行账户不能是dapp的拥有者
        await this.helperLogicVerifier.isDAppPossessor(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // entityFactory 的发行账户不能是位名的拥有者账户或管理账户
        await this.helperLogicVerifier.isLnsPossessorOrManager(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // entityFactory 的发行账户不能是 entity 拥有者
        await this.helperLogicVerifier.isEntityPossessor(
          address,
          this.configHelper,
          accountGetterHelper,
        );

        // 保证账户上足够的本链资产，避免 py 操作
        const {
          magic: chainMagic,
          assetType: chainAssetType,
          issueEntityFactoryMinChainAsset,
        } = this.configHelper;
        const remainChainAsset =
          accountAssets[chainMagic][chainAssetType].assetNumber - BigInt(transaction.fee);
        if (BigInt(issueEntityFactoryMinChainAsset) > remainChainAsset) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `No enough asset, Min account asset ${issueEntityFactoryMinChainAsset}, remain Assets: ${remainChainAsset}`,
            errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
          });
        }

        // 验证最大发行数量
        const calcMaxEntities = this.jsbiHelper.multiplyFloorFraction(
          remainChainAsset,
          this.configHelper.maxMultipleOfEntityAndMainAsset,
        );
        if (BigInt(numberOfEntities) > calcMaxEntities) {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
            prop: `numberOfEntities ${numberOfEntities}`,
            target: `issueEntityFactory`,
            field: `calc max entities ${calcMaxEntities}`,
          });
        }

        // entityFactory 是否已经存在
        const memEntityFactory = await accountGetterHelper.getEntityFactory(
          sourceChainMagic,
          factoryId,
          currentBlockHeight,
        );
        if (memEntityFactory) {
          throw new ConsensusException(ERROR_LIST.ENTITY_FACTORY_IS_ALREADY_EXIST, {
            factoryId,
            errorId: NewTransactionRefuseReason.ENTITY_FACTORY_ALREADY_EXIST,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/issueEntityFactory` },
    );
  }

  listenEventIssueEntity(
    accountAssets: BFChainCore.AccountAssets,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行 entityFactory
    eventEmitter.on(
      "issueEntity",
      async ({ transaction, applyInfo }, next) => {
        const {
          address,
          possessorAddress,
          entityFactoryPossessorAddress,
          factoryId,
          entityId,
          sourceChainMagic,
          entityFrozenAssetPrealnum,
        } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为非同质资产的拥有者
          const possessor = await accountGetterHelper.getAccountInfo(possessorAddress);
          if (possessor) {
            const accountStatus = possessor.accountStatus;
            if (
              accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
              accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
              accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
            ) {
              throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
                address: possessorAddress,
                status: accountStatus,
              });
            }
          }
        }

        // entityFactory 是否已经存在
        const memEntityFactory = await accountGetterHelper.getEntityFactory(
          sourceChainMagic,
          factoryId,
          currentBlockHeight,
        );
        if (!memEntityFactory) {
          throw new ConsensusException(ERROR_LIST.ENTITY_FACTORY_IS_NOT_EXIST, {
            factoryId,
            errorId: NewTransactionRefuseReason.ENTITY_FACTORY_NOT_EXIST,
          });
        }

        if (entityFactoryPossessorAddress !== memEntityFactory.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `entityFactoryPossessor ${entityFactoryPossessorAddress}`,
            be_compare_prop: "issueEntity",
            to_target: `possessorAddress ${memEntityFactory.possessorAddress}`,
            be_target: "memEntityFactory",
          });
        }

        if (memEntityFactory.remainNumberOfEntities === 0) {
          throw new ConsensusException(ERROR_LIST.ISSUE_ENTITY_TIMES_USE_UP, {
            entityFactory: factoryId,
          });
        }

        // entityFactory 是否已经存在
        const memEntity = await accountGetterHelper.getEntity(
          sourceChainMagic,
          entityId,
          currentBlockHeight,
        );
        if (memEntity) {
          throw new ConsensusException(ERROR_LIST.ENTITY_IS_ALREADY_EXIST, {
            entityId,
            errorId: NewTransactionRefuseReason.ENTITY_ALREADY_EXIST,
          });
        }

        const { magic: chainMagic, assetType: chainAssetType } = this.configHelper;
        let remainBalance =
          accountAssets[chainMagic][chainAssetType].assetNumber - BigInt(transaction.fee);
        const purchaseAssetPrealnum = memEntityFactory.purchaseAssetPrealnum;
        if (purchaseAssetPrealnum !== "0") {
          remainBalance -= BigInt(purchaseAssetPrealnum);
          if (remainBalance < BigInt(0)) {
            throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
              reason: `No enough asset, Min account asset ${purchaseAssetPrealnum}, remain Assets: ${remainBalance}`,
              errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
            });
          }
        }
        if (entityFrozenAssetPrealnum !== "0") {
          if (BigInt(entityFrozenAssetPrealnum) > remainBalance) {
            throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
              reason: `No enough asset, Min account asset ${entityFrozenAssetPrealnum}, remain Assets: ${remainBalance}`,
              errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
            });
          }
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/issueEntity` },
    );
  }

  listenEventDestoryEntity(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 资产销毁
    eventEmitter.on(
      "destoryEntity",
      async ({ transaction, applyInfo }, next) => {
        const {
          sourceChainMagic,
          entityId,
          entityFactoryApplicantAddress,
          entityFactoryPossessorAddress,
          entityFactory,
        } = applyInfo;

        const factoryId = entityFactory.factoryId;
        // entityFactory 是否已经存在
        const memEntityFactory = await accountGetterHelper.getEntityFactory(
          sourceChainMagic,
          factoryId,
          currentBlockHeight,
        );
        if (!memEntityFactory) {
          throw new ConsensusException(ERROR_LIST.ENTITY_FACTORY_IS_NOT_EXIST, {
            factoryId,
            errorId: NewTransactionRefuseReason.ENTITY_FACTORY_NOT_EXIST,
          });
        }

        if (entityFactoryApplicantAddress !== memEntityFactory.applyAddress) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `entityFactoryApplicant ${entityFactoryApplicantAddress}`,
            be_compare_prop: "destoryEntity",
            to_target: `applyAddress ${memEntityFactory.applyAddress}`,
            be_target: "memEntityFactory",
          });
        }

        if (entityFactoryPossessorAddress !== memEntityFactory.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `entityFactoryPossessor ${entityFactoryPossessorAddress}`,
            be_compare_prop: "destoryEntity",
            to_target: `possessorAddress ${memEntityFactory.possessorAddress}`,
            be_target: "memEntityFactory",
          });
        }

        const memEntity = await accountGetterHelper.getEntity(
          sourceChainMagic,
          entityId,
          currentBlockHeight,
        );
        if (!memEntity) {
          throw new ConsensusException(ERROR_LIST.ENTITY_IS_NOT_EXIST, {
            entityId,
            errorId: NewTransactionRefuseReason.ENTITY_NOT_EXIST,
          });
        }

        // 冻结状态的位名不能销毁
        if (memEntity.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTORY_ENTITY, {
            entityId,
            reason: "Frozen entity can not be destory",
          });
        }

        // 冻结状态的位名不能销毁
        if (memEntity.status === ASSET_STATUS.DESTORY) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTORY_ENTITY, {
            entityId,
            reason: "Entity already be destory",
          });
        }

        // 只有 entity 的拥有者才能删除位名
        if (memEntity.possessorAddress !== transaction.senderId) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTORY_ENTITY, {
            entityId,
            reason: `Only entity possessor can deestory entity ${entityId}`,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/destoryEntity` },
    );
  }

  listenEventFrozenEntity(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结 entity，entity 冻结
    eventEmitter.on(
      "frozenEntity",
      async ({ applyInfo }, next) => {
        const { address, sourceChainMagic, entityId } = applyInfo;

        // entity 是否存在
        const memEntity = (await accountGetterHelper.getEntity(
          sourceChainMagic,
          entityId,
          currentBlockHeight,
        )) as BFChainCore.IssueEntityInfo | undefined;
        if (!memEntity) {
          throw new ConsensusException(ERROR_LIST.ENTITY_IS_NOT_EXIST, {
            entityId,
            errorId: NewTransactionRefuseReason.ENTITY_NOT_EXIST,
          });
        }
        if (memEntity.possessorAddress !== address) {
          throw new ConsensusException(ERROR_LIST.ACCOUNT_NOT_ENTITY_POSSESSOR, {
            address,
            entityId,
            errorId: NewTransactionRefuseReason.ACCOUNT_NOT_ENTITY_POSSESSOR,
          });
        }
        // 实体处于冻结状态
        if (memEntity.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_FROZEN, {
            entityId,
          });
        }
        // 实体已经销毁
        if (memEntity.status === ASSET_STATUS.DESTORY) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_DESTORY, {
            entityId,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenEntity` },
    );
  }

  listenEventUnfrozenEntity(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻 entity，entity 解冻，更换拥有者
    eventEmitter.on(
      "unfrozenEntity",
      async ({ transaction, applyInfo }, next) => {
        const { address, sourceChainMagic, entityId } = applyInfo;

        // entity 是否存在
        const memEntity = (await accountGetterHelper.getEntity(
          sourceChainMagic,
          entityId,
          currentBlockHeight,
        )) as BFChainCore.LocationNameInfo | undefined;
        if (!memEntity) {
          throw new ConsensusException(ERROR_LIST.ENTITY_IS_ALREADY_EXIST, {
            entityId,
            errorId: NewTransactionRefuseReason.ENTITY_NOT_EXIST,
          });
        }
        // 实体处于非冻结状态
        if (memEntity.status === ASSET_STATUS.NORMAL) {
          throw new ConsensusException(ERROR_LIST.ENTITY_NOT_FROZEN, {
            entityId,
          });
        }
        // 销毁状态的 entity 不能解冻
        if (memEntity.status === ASSET_STATUS.DESTORY) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_DESTORY, {
            entityId,
          });
        }
        // if (memEntity.possessorAddress === address) {
        //   throw new ConsensusException(NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
        //     type: "entity",
        //     asset: entityId,
        //   });
        // }
        if (transaction.recipientId !== memEntity.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `recipientId ${transaction.recipientId}`,
            to_target: "transaction",
            be_compare_prop: `entity possessor ${memEntity.possessorAddress}`,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenEntity` },
    );
  }

  listenEventChangeEntityPossessor(
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 更改 entity 拥有者
    eventEmitter.on(
      "changeEntityPossessor",
      async ({ transaction, applyInfo }, next) => {
        const { address, possessorAddress, sourceChainMagic, entityId } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为非同质资产的拥有者
          const possessor = await accountGetterHelper.getAccountInfo(possessorAddress);
          if (possessor) {
            const accountStatus = possessor.accountStatus;
            if (
              accountStatus === ACCOUNT_STATUS.FROZEN_IN ||
              accountStatus === ACCOUNT_STATUS.FROZEN_OUT ||
              accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT
            ) {
              throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
                address: possessorAddress,
                status: accountStatus,
              });
            }
          }
        }

        // entity 是否存在
        const memEntity = (await accountGetterHelper.getEntity(
          sourceChainMagic,
          entityId,
          currentBlockHeight,
        )) as BFChainCore.LocationNameInfo | undefined;
        if (!memEntity) {
          throw new ConsensusException(ERROR_LIST.ENTITY_IS_ALREADY_EXIST, {
            entityId,
            errorId: NewTransactionRefuseReason.ENTITY_NOT_EXIST,
          });
        }
        // 冻结状态的 entity 不能更改拥有者
        if (memEntity.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_FROZEN, {
            entityId,
          });
        }
        // 销毁状态的 entity 不能更改拥有者
        if (memEntity.status === ASSET_STATUS.DESTORY) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_DESTORY, {
            entityId,
          });
        }
        // 只有 entity 拥有者才能更改拥有者
        if (transaction.senderId !== memEntity.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `senderId ${transaction.senderId}`,
            to_target: "transaction",
            be_compare_prop: `entity possessor ${memEntity.possessorAddress}`,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/changeEntityPossessor` },
    );
  }

  listenEventMigrateCertificate(
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 记录迁移凭证
    eventEmitter.on(
      "migrateCertificate",
      async ({ applyInfo }, next) => {
        const { migrateCertificateId } = applyInfo;

        // 获取迁移凭证
        const migrateCertificate = await accountGetterHelper.getMigrateCertificate(
          migrateCertificateId,
        );
        if (migrateCertificate) {
          throw new ConsensusException(ERROR_LIST.ASSET_IS_ALREADY_MIGRATION, {
            migrateCertificateId,
          });
        }

        next();
      },
      { taskname: `applyTransaction/logicVerifier/migrateCertificate` },
    );
  }

  /**
   * 等待事件处理结果
   *
   * @param transaction
   */
  async awaitEventResult(
    transaction: BFChainCore.Transaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    await this.transactionCore
      .getTransactionFactoryFromType(transaction.type)
      .applyTransaction(transaction, eventEmitter);
  }
}

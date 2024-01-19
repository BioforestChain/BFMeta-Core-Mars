import { Injectable, Inject, getHexFromArrayBuffer } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  NewTransactionRefuseReason,
  ACCOUNT_STATUS,
  ASSET_STATUS,
  LOCATION_NAME_LEVEL,
  RECORD_OPERATION_TYPE,
  TOKEN_TO_BEN,
  PARENT_ASSET_TYPE,
  IssueEntityTransaction,
  DestroyEntityTransaction,
  IssueEntityTransactionV1,
  IssueEntityMultiTransactionV1,
  CERTIFICATE_TYPE,
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
  @Inject("accountGetterHelper", { dynamics: true })
  protected accountGetterHelper!: BFChainCore.AccountGetterHelperInterface;

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

  private __listenEventFee(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 扣除手续费
    eventEmitter.on(
      "fee",
      async ({ transaction, applyInfo }, next) => {
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
        const accountAssets = await this.helperLogicVerifier.getAccountAssetsForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        accountAssets[magic] = accountAssets[magic] || {};
        accountAssets[magic][assetType] = accountAssets[magic][assetType] || {
          sourceChainMagic: magic,
          assetType,
          assetNumber: BigInt(0),
          history: {},
        };
        const hodingAsset = accountAssets[magic][assetType];
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/fee` },
    );
  }

  private __listenEventDestroyMainAsset(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 扣除手续费
    eventEmitter.on(
      "destroyMainAsset",
      async ({ transaction, applyInfo }, next) => {
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
        const { amount, sourceAmount } = applyInfo;
        // 是否有足够的剩余主权益
        const memAssets = await this.accountGetterHelper.getAsset(magic, assetType);
        if (!memAssets) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_EXIST, {
            magic: magic,
            assetType,
            errorId: NewTransactionRefuseReason.ASSET_NOT_EXIST,
          });
        }
        if (memAssets.remainAssetPrealnum < BigInt(sourceAmount)) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `Asset ${magic} ${assetType} remain: ${memAssets.remainAssetPrealnum.toString()} destroyAsset: ${amount}`,
            errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/destroyMainAsset` },
    );
  }

  private __listenEventAsset(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 扣除资产
    eventEmitter.on(
      "asset",
      async ({ transaction, applyInfo }, next) => {
        const { magic, assetType } = applyInfo.assetInfo;
        const address = applyInfo.address;
        const accountAssets = await this.helperLogicVerifier.getAccountAssetsForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        accountAssets[magic] = accountAssets[magic] || {};
        accountAssets[magic][assetType] = accountAssets[magic][assetType] || {
          sourceChainMagic: magic,
          assetType,
          assetNumber: BigInt(0),
          history: {},
        };
        const hodingAsset = accountAssets[magic][assetType];
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/asset` },
    );
  }

  private __listenEventFrozenAsset(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结资产
    eventEmitter.on(
      "frozenAsset",
      async ({ transaction, applyInfo }, next) => {
        const { magic, assetType } = applyInfo.assetInfo;
        const address = applyInfo.address;
        const accountAssets = await this.helperLogicVerifier.getAccountAssetsForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        accountAssets[magic] = accountAssets[magic] || {};
        accountAssets[magic][assetType] = accountAssets[magic][assetType] || {
          sourceChainMagic: magic,
          assetType,
          assetNumber: BigInt(0),
          history: {},
        };
        const hodingAsset = accountAssets[magic][assetType];
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenAsset` },
    );
  }

  private __listenEventUnfrozenAsset(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻资产
    eventEmitter.on(
      "unfrozenAsset",
      async ({ transaction, applyInfo }, next) => {
        const { assetInfo, frozenId, amount: spendAsset, recipientId } = applyInfo;
        const { magic, assetType } = assetInfo;

        // 获取冻结信息
        const frozenAsset = await this.accountGetterHelper.getFrozenAsset(
          recipientId,
          frozenId,
          assetType,
        );

        if (!frozenAsset) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_NOT_EXIST_OR_EXPIRED, {
            frozenAddress: recipientId,
            signature: frozenId,
            assetType,
          });
        }

        const {
          maxEffectiveHeight,
          minEffectiveHeight,
          remainUnfrozenTimes,
          amount: remainAsset,
        } = frozenAsset;
        // 是否到达解冻高度
        if (minEffectiveHeight > currentBlockHeight) {
          throw new ConsensusException(ERROR_LIST.NOT_BEGIN_UNFROZEN_YET, {
            frozenId,
          });
        }

        // 交易交易是否过期
        if (currentBlockHeight > maxEffectiveHeight) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_EXPIRATION, {
            frozenId,
          });
        }

        if (maxEffectiveHeight < currentBlockHeight) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_EXPIRATION, {
            frozenId,
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
              frozenId,
            });
          }
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenAsset` },
    );
  }

  private __listenEventSignForAsset(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻资产
    eventEmitter.on(
      "signForAsset",
      async ({ transaction, applyInfo }, next) => {
        const { frozenId, frozenAddress, assetInfo } = applyInfo;

        // 获取冻结信息
        const frozenAsset = await this.accountGetterHelper.getFrozenAsset(
          frozenAddress,
          frozenId,
          assetInfo.assetType,
        );

        if (!frozenAsset) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_NOT_EXIST_OR_EXPIRED, {
            address: frozenAddress,
            signature: frozenId,
            assetType: assetInfo.assetType,
          });
        }

        const { maxEffectiveHeight, minEffectiveHeight, remainUnfrozenTimes, amount } = frozenAsset;
        // 是否到达解冻高度
        if (minEffectiveHeight > currentBlockHeight) {
          throw new ConsensusException(ERROR_LIST.NOT_BEGIN_UNFROZEN_YET, {
            frozenId,
          });
        }

        // 交易交易是否过期
        if (currentBlockHeight > maxEffectiveHeight) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_EXPIRATION, {
            frozenId,
          });
        }

        if (maxEffectiveHeight < currentBlockHeight) {
          throw new ConsensusException(ERROR_LIST.FROZEN_ASSET_EXPIRATION, {
            frozenId,
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
              frozenId,
            });
          }
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/signForAsset` },
    );
  }

  private __listenEventFrozenAccount(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结账户
    eventEmitter.on(
      "frozenAccount",
      async ({ applyInfo }, next) => {
        const { address } = applyInfo;
        const accountInfo = await this.helperLogicVerifier.getAccountInfoForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        const accountStatus = accountInfo.accountStatus;
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenAccount` },
    );
  }

  private __listenEventSetSecondPublicKey(eventEmitter: BFChainCore.ApplyTransactionEventEmitter) {
    // 设置二次密码
    eventEmitter.on(
      "setSecondPublicKey",
      ({ applyInfo }, next) => {
        return next();
      },
      { taskname: `applyTransaction/logicVerifier/setSecondPublicKey` },
    );
  }

  private async __checkAsset(genesisAddress: string, assetType: string) {
    // 不能将冻结账户设置为同质资产的创世账户
    await this.helperLogicVerifier.isAccountFrozen(genesisAddress);

    const chainMagic = this.configHelper.magic;

    // 验证资产名是否被禁用
    const result = await this.accountGetterHelper.isCurrencyForbidden(assetType);
    if (result) {
      throw new ConsensusException(ERROR_LIST.FORBIDDEN, {
        prop: `AssetType ${assetType}`,
        target: "blockChain",
      });
    }

    // 验证资产名是否已经存在
    const memLegalCurrency = await this.accountGetterHelper.getCurrency(assetType);
    if (memLegalCurrency) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
        prop: `AssetType ${assetType}`,
        target: "blockChain",
        errorId: NewTransactionRefuseReason.ASSETTYPE_ALREADY_EXIST,
      });
    }

    // 验证资产是否已经存在
    const memAssets = await this.accountGetterHelper.getAsset(chainMagic, assetType);
    if (memAssets) {
      throw new ConsensusException(ERROR_LIST.ASSET_NOT_EXIST, {
        magic: chainMagic,
        assetType,
        errorId: NewTransactionRefuseReason.ASSET_NOT_EXIST,
      });
    }
  }

  private __listenEventIssueAsset(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行数字资产
    eventEmitter.on(
      "issueAsset",
      async ({ transaction, applyInfo }, next) => {
        const { address, assetInfo, genesisAddress, sourceAmount } = applyInfo;
        const { assetType } = assetInfo;

        await this.__checkAsset(genesisAddress, assetType);

        const accountAssets = await this.helperLogicVerifier.getAccountAssetsForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        // 是否持有除链资产外的其他资产
        await this.helperLogicVerifier.isPossessAssetExceptChainAsset(address, accountAssets);

        // 是否持有链上资产
        await this.helperLogicVerifier.isChainAssetPossessor(address);

        // 保证账户上足够的本链资产，避免 py 操作
        const {
          magic: chainMagic,
          assetType: chainAssetType,
          issueAssetMinChainAsset,
        } = this.configHelper;
        const remainChainAsset = accountAssets[chainMagic][chainAssetType].assetNumber;
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/issueAsset` },
    );
  }

  private __listenEventDestroyAsset(eventEmitter: BFChainCore.ApplyTransactionEventEmitter) {
    // 资产销毁
    eventEmitter.on(
      "destroyAsset",
      async ({ applyInfo }, next) => {
        const { sourceAmount, assetInfo } = applyInfo;
        const { magic, assetType } = assetInfo;
        // 验证资产是否已经存在
        const memAssets = await this.accountGetterHelper.getAsset(magic, assetType);
        if (!memAssets) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_EXIST, {
            magic,
            assetType,
            errorId: NewTransactionRefuseReason.ASSET_NOT_EXIST,
          });
        }

        if (memAssets.remainAssetPrealnum < BigInt(sourceAmount)) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `Asset ${magic} ${assetType} remain: ${memAssets.remainAssetPrealnum.toString()} destroyAsset: ${sourceAmount}`,
            errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/destroyAsset` },
    );
  }

  private __listenEventIssueDAppid(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行 dapid
    eventEmitter.on(
      "issueDAppid",
      async ({ applyInfo }, next) => {
        const { address, dappid, sourceChainMagic, possessorAddress } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为 dapp 的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }

        // dappid 是否已经存在
        const memDapp = await this.accountGetterHelper.getDApp(
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/issueDAppid` },
    );
  }

  private __listenEventFrozenDAppid(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结 dappid
    eventEmitter.on(
      "frozenDAppid",
      async ({ applyInfo }, next) => {
        const { address, sourceChainName, sourceChainMagic, dappid } = applyInfo;

        const memDapp = await this.helperLogicVerifier.isDAppExist(
          sourceChainName,
          sourceChainMagic,
          dappid,
          currentBlockHeight,
        );
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenDAppid` },
    );
  }

  private __listenEventUnfrozenDAppid(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻 dappid
    eventEmitter.on(
      "unfrozenDAppid",
      async ({ transaction, applyInfo }, next) => {
        const { address, sourceChainName, sourceChainMagic, dappid, frozenId } = applyInfo;

        const memDapp = await this.helperLogicVerifier.isDAppExist(
          sourceChainName,
          sourceChainMagic,
          dappid,
          currentBlockHeight,
        );
        // dapp 尚未冻结
        if (memDapp.status !== ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.DAPPID_NOT_FROZEN, {
            dappid,
          });
        }
        // 冻结 id 不匹配
        if (memDapp.frozenId !== frozenId) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `frozenId ${frozenId}`,
            to_target: "transaction",
            be_compare_prop: `dapp frozenId ${memDapp.frozenId}`,
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenDAppid` },
    );
  }

  private __listenEventChangeDAppidPossessor(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 更改 dappid 拥有者
    eventEmitter.on(
      "changeDAppidPossessor",
      async ({ transaction, applyInfo }, next) => {
        const { address, possessorAddress, sourceChainName, sourceChainMagic, dappid } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为 dappid 的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }

        const memDapp = await this.helperLogicVerifier.isDAppExist(
          sourceChainName,
          sourceChainMagic,
          dappid,
          currentBlockHeight,
        );
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/changeDAppidPossessor` },
    );
  }

  private __listenEventRegisterChain(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 注册链
    eventEmitter.on(
      "registerChain",
      async ({ transaction, applyInfo }, next) => {
        const { address, genesisBlock } = applyInfo;

        const accountAssets = await this.helperLogicVerifier.getAccountAssetsForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        // 是否持有除链资产外的其他资产
        await this.helperLogicVerifier.isPossessAssetExceptChainAsset(address, accountAssets);

        // 是否持有链上资产
        await this.helperLogicVerifier.isChainAssetPossessor(address);

        // 保证账户上足够的本链资产，避免 py 操作
        const {
          magic: chainMagic,
          assetType: chainAssetType,
          registerChainMinChainAsset,
        } = this.configHelper;
        const remainBalance = accountAssets[chainMagic][chainAssetType].assetNumber;
        if (BigInt(registerChainMinChainAsset) > remainBalance) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `No enough asset, Min account asset ${registerChainMinChainAsset}, remain Assets: ${remainBalance}`,
            errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
          });
        }

        const { magic, assetType, chainName } = genesisBlock;

        // 验证链网络标识符是否已经存在
        const memMagic = await this.accountGetterHelper.getMagic(magic);
        if (memMagic) {
          throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
            prop: `Magic ${magic}`,
            target: "blockChain",
            errorId: NewTransactionRefuseReason.MAGIC_ALREADY_EXIST,
          });
        }

        // 验证链名是否已经存在
        const memChainName = await this.accountGetterHelper.getCurrency(chainName);
        if (memChainName) {
          throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
            prop: `ChainName ${chainName}`,
            target: "blockChain",
            errorId: NewTransactionRefuseReason.CHAINNAME_ALREADY_EXIST,
          });
        }

        // 验证主权益名是否已经存在
        const memAssetType = await this.accountGetterHelper.getCurrency(assetType);
        if (memAssetType) {
          throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
            prop: `AssetType ${assetType}`,
            target: "blockChain",
            errorId: NewTransactionRefuseReason.ASSETTYPE_ALREADY_EXIST,
          });
        }

        // 链上是否已经存在这个链的创世块
        const memChain = await this.accountGetterHelper.getChain(magic);
        if (memChain) {
          throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
            prop: `Chain with magic ${magic}`,
            target: "blockChain",
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/registerChain` },
    );
  }

  private __listenEventRegisterLocationName(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 注册位名
    eventEmitter.on(
      "registerLocationName",
      async ({ applyInfo }, next) => {
        const { address, sourceChainMagic, name, possessorAddress } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为 lns 的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }

        // 已存在的位名不能重复添加
        const memLocation = await this.accountGetterHelper.getLocationName(
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
        const result = await this.accountGetterHelper.isLocationNameForbidden(name);
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
          const lastMemLocation = await this.accountGetterHelper.getLocationName(
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/registerLocationName` },
    );
  }

  private __listenEventCancelLocationName(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 注销位名
    eventEmitter.on(
      "cancelLocationName",
      async ({ transaction, applyInfo }, next) => {
        const { sourceChainName, sourceChainMagic, name } = applyInfo;

        // const names = name.split(".");
        // // 顶级位名不能删除
        // if (names.length === 2) {
        //   throw new ConsensusException(ERROR_LIST.CAN_NOT_DELETE_LOCATION_NAME, {
        //     locationName: name,
        //     reason: "Top level location name can not be delete",
        //   });
        // }

        // 不存在的位名不能删除
        const memLocation = await this.helperLogicVerifier.isLocationNameExist(
          sourceChainName,
          sourceChainMagic,
          name,
          currentBlockHeight,
        );

        // 冻结状态的位名不能删除
        if (memLocation.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DELETE_LOCATION_NAME, {
            locationName: name,
            reason: "Frozen location name can not be delete",
          });
        }

        // 冻结状态的位名不能删除
        if (memLocation.status === ASSET_STATUS.DESTROY) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DELETE_LOCATION_NAME, {
            locationName: name,
            reason: "Location name has been deleted",
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
        const isSubLnsExist = await this.accountGetterHelper.isSubLocationNameExist(
          sourceChainMagic,
          name,
        );
        if (isSubLnsExist) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DELETE_LOCATION_NAME, {
            locationName: name,
            reason: "Location name have child location name, please delete it at first",
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/cancelLocationName` },
    );
  }

  private __listenEventSetLnsManager(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 设置位名管理员
    eventEmitter.on(
      "setLnsManager",
      async ({ applyInfo }, next) => {
        const { address, sourceChainName, sourceChainMagic, name, manager } = applyInfo;

        // 不能将冻结账户设置为管理员
        await this.helperLogicVerifier.isAccountFrozen(manager);

        // 位名不存在不能设置管理员
        const memLocation = await this.helperLogicVerifier.isLocationNameExist(
          sourceChainName,
          sourceChainMagic,
          name,
          currentBlockHeight,
        );

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

        if (memLocation.type === LOCATION_NAME_LEVEL.MULTI_LEVEL) {
          const names = name.split(".");
          const index = names[0].length + 1;
          const lastLocationName = name.substr(index);
          const lastMemLocation = await this.accountGetterHelper.getLocationName(
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/setLnsManager` },
    );
  }

  private __listenEventSetLnsRecordValue(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 设置位名解析值
    eventEmitter.on(
      "setLnsRecordValue",
      async ({ applyInfo }, next) => {
        const {
          address,
          sourceChainName,
          sourceChainMagic,
          name,
          operationType,
          addRecord,
          deleteRecord,
        } = applyInfo;

        // 校验当前位名是否存存在
        const memLocation = await this.helperLogicVerifier.isLocationNameExist(
          sourceChainName,
          sourceChainMagic,
          name,
          currentBlockHeight,
        );

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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/setLnsRecordValue` },
    );
  }

  private __listenEventFrozenLocationName(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结位名
    eventEmitter.on(
      "frozenLocationName",
      async ({ applyInfo }, next) => {
        const { address, sourceChainName, sourceChainMagic, name } = applyInfo;

        // 位名是否存在
        const memLocation = await this.helperLogicVerifier.isLocationNameExist(
          sourceChainName,
          sourceChainMagic,
          name,
          currentBlockHeight,
        );
        if (memLocation.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_ALREADY_FROZEN, {
            locationName: name,
          });
        }
        // 只有顶级位名能交换
        if (memLocation.type !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
          throw new ConsensusException(ERROR_LIST.ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE);
        }
        if (memLocation.possessorAddress !== address) {
          throw new ConsensusException(ERROR_LIST.ACCOUNT_NOT_LOCATION_NAME_POSSESSOR, {
            address,
            locationName: name,
            errorId: NewTransactionRefuseReason.ACCOUNT_NOT_LNS_POSSESSOR,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenLocationName` },
    );
  }

  private __listenEventUnfrozenLocationName(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻位名，更换拥有者
    eventEmitter.on(
      "unfrozenLocationName",
      async ({ transaction, applyInfo }, next) => {
        const { address, sourceChainName, sourceChainMagic, name, frozenId } = applyInfo;

        // 位名是否存在
        const memLocation = await this.helperLogicVerifier.isLocationNameExist(
          sourceChainName,
          sourceChainMagic,
          name,
          currentBlockHeight,
        );
        // 位名尚未冻结
        if (memLocation.status !== ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.LOCATION_NAME_NOT_FROZEN, {
            locationName: name,
          });
        }
        // 冻结 id 不匹配
        if (memLocation.frozenId !== frozenId) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `frozenId ${frozenId}`,
            to_target: "transaction",
            be_compare_prop: `location name frozenId ${memLocation.frozenId}`,
          });
        }
        // 只有顶级位名能交换
        if (memLocation.type !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenLocationName` },
    );
  }

  private __listenEventChangeLocationNamePossessor(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 更改位名的拥有者
    eventEmitter.on(
      "changeLocationNamePossessor",
      async ({ transaction, applyInfo }, next) => {
        const { address, possessorAddress, sourceChainName, sourceChainMagic, name } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为链域名的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }

        // 位名是否存在
        const memLocation = await this.helperLogicVerifier.isLocationNameExist(
          sourceChainName,
          sourceChainMagic,
          name,
          currentBlockHeight,
        );
        // 只有顶级位名才能更改拥有者
        if (memLocation.type !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/changeLocationNamePossessor` },
    );
  }

  private async __checkEntityFactory(
    currentBlockHeight: number,
    possessorAddress: string,
    sourceChainMagic: string,
    factoryId: string,
  ) {
    // 不能将冻结账户设置为非同质资产模板的拥有者账户
    await this.helperLogicVerifier.isAccountFrozen(possessorAddress);

    // entityFactory 是否已经存在
    const memEntityFactory = await this.accountGetterHelper.getEntityFactory(
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
  }

  private __listenEventIssueEntityFactoryByFrozen(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行 entityFactory
    eventEmitter.on(
      "issueEntityFactoryByFrozen",
      async ({ transaction, applyInfo }, next) => {
        const { address, factoryId, sourceChainMagic, possessorAddress, entityPrealnum } =
          applyInfo;

        await this.__checkEntityFactory(
          currentBlockHeight,
          possessorAddress,
          sourceChainMagic,
          factoryId,
        );

        const accountAssets = await this.helperLogicVerifier.getAccountAssetsForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        // 是否持有除链资产外的其他资产
        await this.helperLogicVerifier.isPossessAssetExceptChainAsset(address, accountAssets);

        // 是否持有链上资产
        await this.helperLogicVerifier.isChainAssetPossessor(address);

        // 保证账户上足够的本链资产，避免 py 操作
        const {
          magic: chainMagic,
          assetType: chainAssetType,
          issueEntityFactoryMinChainAsset,
        } = this.configHelper;
        const remainChainAsset = accountAssets[chainMagic][chainAssetType].assetNumber;
        if (BigInt(issueEntityFactoryMinChainAsset) > remainChainAsset) {
          throw new ConsensusException(ERROR_LIST.ASSET_NOT_ENOUGH, {
            reason: `No enough asset, Min account asset ${issueEntityFactoryMinChainAsset}, remain Assets: ${remainChainAsset}`,
            errorId: NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
          });
        }

        // 验证最大发行数量
        const calcMaxEntities = this.jsbiHelper.multiplyFractionAndFloor(
          /// 要把 本 换算成 个
          {
            numerator: remainChainAsset,
            denominator: TOKEN_TO_BEN,
          },
          this.configHelper.maxMultipleOfEntityAndMainAsset,
        );
        if (BigInt(entityPrealnum) > calcMaxEntities) {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
            prop: `entityPrealnum ${entityPrealnum}`,
            target: `issueEntityFactory`,
            field: `calc max entities ${calcMaxEntities}`,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/issueEntityFactoryByFrozen` },
    );
  }

  private __listenEventIssueEntityFactoryByDestroy(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行 entityFactory
    eventEmitter.on(
      "issueEntityFactoryByDestroy",
      async ({ transaction, applyInfo }, next) => {
        const { factoryId, sourceChainMagic, possessorAddress } = applyInfo;

        await this.__checkEntityFactory(
          currentBlockHeight,
          possessorAddress,
          sourceChainMagic,
          factoryId,
        );

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/issueEntityFactoryByDestroy` },
    );
  }

  private __isEntityFactoryMatch(
    prevEntityFactory: BFChainCore.IssueEntityFactoryJSON,
    nextEntityFactory: BFChainCore.IssueEntityFactoryInfo,
    transactionType: string,
  ) {
    if (
      prevEntityFactory.sourceChainMagic !== nextEntityFactory.sourceChainMagic ||
      prevEntityFactory.sourceChainName !== nextEntityFactory.sourceChainName ||
      prevEntityFactory.factoryId !== nextEntityFactory.factoryId ||
      prevEntityFactory.entityPrealnum !== nextEntityFactory.entityPrealnum.toString() ||
      prevEntityFactory.entityFrozenAssetPrealnum !== nextEntityFactory.entityFrozenAssetPrealnum ||
      prevEntityFactory.purchaseAssetPrealnum !== nextEntityFactory.purchaseAssetPrealnum
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `entityFactory ${JSON.stringify(prevEntityFactory)}`,
        be_compare_prop: `entityFactory ${JSON.stringify({
          sourceChainName: nextEntityFactory.sourceChainName,
          sourceChainMagic: nextEntityFactory.sourceChainMagic,
          factoryId: nextEntityFactory.factoryId,
          entityPrealnum: nextEntityFactory.entityPrealnum.toString(),
          entityFrozenAssetPrealnum: nextEntityFactory.entityFrozenAssetPrealnum,
          purchaseAssetPrealnum: nextEntityFactory.purchaseAssetPrealnum,
        })}`,
        to_target: transactionType,
        be_target: "blockChain",
      });
    }
  }

  private __listenEventIssueEntity(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行 entityId
    eventEmitter.on(
      "issueEntity",
      async ({ transaction, applyInfo }, next) => {
        const {
          address,
          possessorAddress,
          entityFactoryPossessorAddress,
          factoryId,
          entityId,
          sourceChainName,
          sourceChainMagic,
          entityFrozenAssetPrealnum,
        } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为非同质资产的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }

        // entityFactory 是否已经存在
        const memEntityFactory = await this.helperLogicVerifier.isEntityFactoryExist(
          sourceChainName,
          sourceChainMagic,
          factoryId,
          currentBlockHeight,
        );

        this.__isEntityFactoryMatch(
          (transaction as IssueEntityTransaction).asset.issueEntity.entityFactory.toJSON(),
          memEntityFactory,
          "IssueEntityTransaction",
        );

        if (entityFactoryPossessorAddress !== memEntityFactory.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `entityFactoryPossessor ${entityFactoryPossessorAddress}`,
            be_compare_prop: `possessorAddress ${memEntityFactory.possessorAddress}`,
            to_target: `issueEntity`,
            be_target: "memEntityFactory",
          });
        }

        // if (possessorAddress === memEntityFactory.applyAddress) {
        //   throw new ConsensusException(ERROR_LIST.SHOULD_NOT_BE, {
        //     to_compare_prop: `entityPossessor ${possessorAddress}`,
        //     be_compare_prop: `entityFactoryApplicant ${memEntityFactory.applyAddress}`,
        //     to_target: `issueEntity`,
        //     be_target: "memEntityFactory",
        //   });
        // }

        const { remainEntityPrealnum } = memEntityFactory;
        if (remainEntityPrealnum === BigInt(0)) {
          throw new ConsensusException(ERROR_LIST.ISSUE_ENTITY_TIMES_USE_UP, {
            entityFactory: factoryId,
          });
        }

        // 如果模板没有被使用过，则不需要校验 entity 是否已经存在
        if (memEntityFactory.entityPrealnum !== remainEntityPrealnum) {
          // entityFactory 是否已经存在
          const memEntity = await this.accountGetterHelper.getEntity(
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
        }

        const accountAssets = await this.helperLogicVerifier.getAccountAssetsForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        const { magic: chainMagic, assetType: chainAssetType } = this.configHelper;
        let remainBalance = accountAssets[chainMagic][chainAssetType].assetNumber;
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/issueEntity` },
    );
  }

  private __listenEventIssueEntityV1(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行 entityId
    eventEmitter.on(
      "issueEntityV1",
      async ({ transaction, applyInfo }, next) => {
        const {
          address,
          possessorAddress,
          entityFactoryPossessorAddress,
          factoryId,
          entityId,
          sourceChainName,
          sourceChainMagic,
          entityFrozenAssetPrealnum,
        } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为非同质资产的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }

        // entityFactory 是否已经存在
        const memEntityFactory = await this.helperLogicVerifier.isEntityFactoryExist(
          sourceChainName,
          sourceChainMagic,
          factoryId,
          currentBlockHeight,
        );

        this.__isEntityFactoryMatch(
          (transaction as IssueEntityTransactionV1).asset.issueEntity.entityFactory.toJSON(),
          memEntityFactory,
          "IssueEntityTransactionV1",
        );

        if (entityFactoryPossessorAddress !== memEntityFactory.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `entityFactoryPossessor ${entityFactoryPossessorAddress}`,
            be_compare_prop: `possessorAddress ${memEntityFactory.possessorAddress}`,
            to_target: `issueEntity`,
            be_target: "memEntityFactory",
          });
        }

        // if (possessorAddress === memEntityFactory.applyAddress) {
        //   throw new ConsensusException(ERROR_LIST.SHOULD_NOT_BE, {
        //     to_compare_prop: `entityPossessor ${possessorAddress}`,
        //     be_compare_prop: `entityFactoryApplicant ${memEntityFactory.applyAddress}`,
        //     to_target: `issueEntity`,
        //     be_target: "memEntityFactory",
        //   });
        // }

        if (memEntityFactory.remainEntityPrealnum === BigInt(0)) {
          throw new ConsensusException(ERROR_LIST.ISSUE_ENTITY_TIMES_USE_UP, {
            entityFactory: factoryId,
          });
        }

        // entityId 是否已经存在
        const memEntity = await this.accountGetterHelper.getEntity(
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

        const accountAssets = await this.helperLogicVerifier.getAccountAssetsForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        const { magic: chainMagic, assetType: chainAssetType } = this.configHelper;
        let remainBalance = accountAssets[chainMagic][chainAssetType].assetNumber;
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/issueEntityV1` },
    );
  }

  private __listenEventIssueEntityMultiV1(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 批量发行 entityId
    eventEmitter.on(
      "issueEntityMultiV1",
      async ({ transaction, applyInfo }, next) => {
        const {
          address,
          possessorAddress,
          entityFactoryPossessorAddress,
          factoryId,
          entityStructList,
          sourceChainName,
          sourceChainMagic,
          entityFrozenAssetPrealnum,
        } = applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为非同质资产的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }

        // entityFactory 是否已经存在
        const memEntityFactory = await this.helperLogicVerifier.isEntityFactoryExist(
          sourceChainName,
          sourceChainMagic,
          factoryId,
          currentBlockHeight,
        );

        this.__isEntityFactoryMatch(
          (
            transaction as IssueEntityMultiTransactionV1
          ).asset.issueEntityMulti.entityFactory.toJSON(),
          memEntityFactory,
          "IssueEntityMultiTransactionV1",
        );

        if (entityFactoryPossessorAddress !== memEntityFactory.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `entityFactoryPossessor ${entityFactoryPossessorAddress}`,
            be_compare_prop: `possessorAddress ${memEntityFactory.possessorAddress}`,
            to_target: `issueEntity`,
            be_target: "memEntityFactory",
          });
        }

        const { remainEntityPrealnum } = memEntityFactory;
        if (remainEntityPrealnum === BigInt(0)) {
          throw new ConsensusException(ERROR_LIST.ISSUE_ENTITY_TIMES_USE_UP, {
            entityFactory: factoryId,
          });
        }

        if (remainEntityPrealnum < BigInt(entityStructList.length)) {
          throw new ConsensusException(ERROR_LIST.NOT_ENOUGH_ISSUE_ENTITY_TIMES, {
            entityFactory: factoryId,
          });
        }

        // 如果这个模板没有使用过，就不用检查 entityId 是否已经存在
        if (memEntityFactory.entityPrealnum !== remainEntityPrealnum) {
          for (const { entityId } of entityStructList) {
            // entityId 是否已经存在
            const memEntity = await this.accountGetterHelper.getEntity(
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
          }
        }

        const accountAssets = await this.helperLogicVerifier.getAccountAssetsForce(
          accountMap,
          address,
          currentBlockHeight,
        );
        const { magic: chainMagic, assetType: chainAssetType } = this.configHelper;
        let remainBalance = accountAssets[chainMagic][chainAssetType].assetNumber;
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/issueEntityV1` },
    );
  }

  private __listenEventDestroyEntity(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 资产销毁
    eventEmitter.on(
      "destroyEntity",
      async ({ transaction, applyInfo }, next) => {
        const {
          sourceChainName,
          sourceChainMagic,
          entityId,
          entityFactoryApplicantAddress,
          entityFactoryPossessorAddress,
          entityFactory,
        } = applyInfo;

        const factoryId = entityFactory.factoryId;
        // entityFactory 是否已经存在
        const memEntityFactory = await this.helperLogicVerifier.isEntityFactoryExist(
          sourceChainName,
          sourceChainMagic,
          factoryId,
          currentBlockHeight,
        );

        this.__isEntityFactoryMatch(
          (transaction as DestroyEntityTransaction).asset.destroyEntity.entityFactory.toJSON(),
          memEntityFactory,
          "DestroyEntityTransaction",
        );

        if (entityFactoryApplicantAddress !== memEntityFactory.applyAddress) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `entityFactoryApplicant ${entityFactoryApplicantAddress}`,
            be_compare_prop: `applyAddress ${memEntityFactory.applyAddress}`,
            to_target: `destroyEntity`,
            be_target: "memEntityFactory",
          });
        }

        if (entityFactoryPossessorAddress !== memEntityFactory.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `entityFactoryPossessor ${entityFactoryPossessorAddress}`,
            be_compare_prop: `possessorAddress ${memEntityFactory.possessorAddress}`,
            to_target: `destroyEntity`,
            be_target: "memEntityFactory",
          });
        }

        const memEntity = await this.helperLogicVerifier.isEntityExist(
          sourceChainName,
          sourceChainMagic,
          entityId,
          currentBlockHeight,
        );

        // 冻结状态的位名不能销毁
        if (memEntity.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTROY_ENTITY, {
            entityId,
            reason: "Frozen entity can not be destroy",
          });
        }

        // 冻结状态的位名不能销毁
        if (memEntity.status === ASSET_STATUS.DESTROY) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_DESTROY, {
            entityId,
            reason: "Entity already be destroy",
          });
        }

        // 只有 entity 的拥有者才能删除位名
        if (memEntity.possessorAddress !== transaction.senderId) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTROY_ENTITY, {
            entityId,
            reason: `Only entity possessor can deestory entity ${entityId}`,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/destroyEntity` },
    );
  }

  private __listenEventFrozenEntity(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结 entity，entity 冻结
    eventEmitter.on(
      "frozenEntity",
      async ({ applyInfo }, next) => {
        const { address, sourceChainName, sourceChainMagic, entityId } = applyInfo;

        // entity 是否存在
        const memEntity = await this.helperLogicVerifier.isEntityExist(
          sourceChainName,
          sourceChainMagic,
          entityId,
          currentBlockHeight,
        );
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
        if (memEntity.status === ASSET_STATUS.DESTROY) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_DESTROY, {
            entityId,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenEntity` },
    );
  }

  private __listenEventUnfrozenEntity(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻 entity，entity 解冻，更换拥有者
    eventEmitter.on(
      "unfrozenEntity",
      async ({ transaction, applyInfo }, next) => {
        const { address, sourceChainName, sourceChainMagic, entityId, frozenId } = applyInfo;

        // entity 是否存在
        const memEntity = await this.helperLogicVerifier.isEntityExist(
          sourceChainName,
          sourceChainMagic,
          entityId,
          currentBlockHeight,
        );
        // 实体处于非冻结状态
        if (memEntity.status === ASSET_STATUS.NORMAL) {
          throw new ConsensusException(ERROR_LIST.ENTITY_NOT_FROZEN, {
            entityId,
          });
        }
        // 冻结 id 不匹配
        if (memEntity.frozenId !== frozenId) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `frozenId ${frozenId}`,
            to_target: "transaction",
            be_compare_prop: `entity frozenId ${memEntity.frozenId}`,
          });
        }
        // 销毁状态的 entity 不能解冻
        if (memEntity.status === ASSET_STATUS.DESTROY) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_DESTROY, {
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenEntity` },
    );
  }

  private __listenEventChangeEntityPossessor(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 更改 entity 拥有者
    eventEmitter.on(
      "changeEntityPossessor",
      async ({ transaction, applyInfo }, next) => {
        const { address, possessorAddress, sourceChainName, sourceChainMagic, entityId } =
          applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为非同质资产的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }

        // entity 是否存在
        const memEntity = await this.helperLogicVerifier.isEntityExist(
          sourceChainName,
          sourceChainMagic,
          entityId,
          currentBlockHeight,
        );
        // 冻结状态的 entity 不能更改拥有者
        if (memEntity.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_FROZEN, {
            entityId,
          });
        }
        // 销毁状态的 entity 不能更改拥有者
        if (memEntity.status === ASSET_STATUS.DESTROY) {
          throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_DESTROY, {
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

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/changeEntityPossessor` },
    );
  }

  private __listenEventMigrateCertificate(eventEmitter: BFChainCore.ApplyTransactionEventEmitter) {
    // 记录迁移凭证
    eventEmitter.on(
      "migrateCertificate",
      async ({ applyInfo }, next) => {
        const { migrateCertificateId } = applyInfo;

        // 获取迁移凭证
        const migrateCertificate = await this.accountGetterHelper.getMigrateCertificate(
          migrateCertificateId,
        );
        if (migrateCertificate) {
          throw new ConsensusException(ERROR_LIST.ASSET_IS_ALREADY_MIGRATION, {
            migrateCertificateId,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/migrateCertificate` },
    );
  }

  private __listenEventPayTax(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 记录迁移凭证
    eventEmitter.on(
      "payTax",
      async ({ applyInfo }, next) => {
        const { sourceChainName, sourceChainMagic, parentAssetType, assetType, taxInformation } =
          applyInfo;

        if (parentAssetType === PARENT_ASSET_TYPE.ENTITY) {
          const memEntity = await this.helperLogicVerifier.isEntityExist(
            sourceChainName,
            sourceChainMagic,
            assetType,
            currentBlockHeight,
          );

          if (memEntity.applyAddress !== taxInformation.taxCollector) {
            throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
              to_compare_prop: `entityApplicant ${memEntity.applyAddress}`,
              be_compare_prop: `taxCollector ${taxInformation.taxCollector}`,
              to_target: `taxInformation`,
              be_target: "memEntity",
            });
          }

          if (memEntity.taxAssetPrealnum !== taxInformation.taxAssetPrealnum) {
            throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
              to_compare_prop: `taxAssetPrealnum ${memEntity.taxAssetPrealnum}`,
              be_compare_prop: `taxAssetPrealnum ${taxInformation.taxAssetPrealnum}`,
              to_target: `taxInformation`,
              be_target: "memEntity",
            });
          }
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/payTax` },
    );
  }

  private __listenEventIssueCertificate(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 发行凭证
    eventEmitter.on(
      "issueCertificate",
      async ({ transaction, applyInfo }, next) => {
        const { address, possessorAddress, sourceChainMagic, sourceChainName, certificateId } =
          applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为非同质资产的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }

        // certificate 是否已经存在
        const memCertificate = await this.accountGetterHelper.getCertificate(
          sourceChainMagic,
          certificateId,
          currentBlockHeight,
        );
        if (memCertificate) {
          throw new ConsensusException(ERROR_LIST.CERTIFICATE_IS_ALREADY_EXIST, {
            certificateId,
            errorId: NewTransactionRefuseReason.CERTIFICATE_ALREADY_EXIST,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/issueCertificate` },
    );
  }

  private __listenEventDestroyCertificate(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 资产销毁
    eventEmitter.on(
      "destroyCertificate",
      async ({ transaction, applyInfo }, next) => {
        const { sourceChainMagic, sourceChainName, certificateId } = applyInfo;

        const memCertificate = await this.helperLogicVerifier.isCertificateExist(
          sourceChainName,
          sourceChainMagic,
          certificateId,
          currentBlockHeight,
        );
        // 凭证已经被销毁
        if (memCertificate.status === ASSET_STATUS.DESTROY) {
          throw new ConsensusException(ERROR_LIST.CERTIFICATE_ALREADY_DESTROY, {
            certificateId,
          });
        }
        // 冻结状态的凭证不能销毁
        if (memCertificate.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTROY_CERTIFICATE, {
            certificateId,
            reason: "Frozen certificate can not be destroy",
          });
        }
        if (memCertificate.type === CERTIFICATE_TYPE.DESTROY_FORBIDDEN) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTROY_CERTIFICATE, {
            certificateId,
            reason: `Certificate with type ${CERTIFICATE_TYPE.DESTROY_FORBIDDEN} can not be destroy`,
          });
        } else if (memCertificate.type === CERTIFICATE_TYPE.DESTROY_BY_APPLICANT) {
          // 只有凭证的发行者才能删除位名
          if (memCertificate.applyAddress !== transaction.senderId) {
            throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTROY_CERTIFICATE, {
              certificateId,
              reason: `Only certificate applicant can deestory certificate ${certificateId}`,
            });
          }
        }

        // 只有凭证的拥有者才能删除位名
        if (memCertificate.possessorAddress !== transaction.senderId) {
          throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTROY_CERTIFICATE, {
            certificateId,
            reason: `Only certificate possessor can deestory certificate ${certificateId}`,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/destroyCertificate` },
    );
  }

  private __listenEventFrozenCertificate(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 冻结凭证
    eventEmitter.on(
      "frozenCertificate",
      async ({ applyInfo }, next) => {
        const { address, sourceChainName, sourceChainMagic, certificateId } = applyInfo;

        // 凭证是否存在
        const memCertificate = await this.helperLogicVerifier.isCertificateExist(
          sourceChainName,
          sourceChainMagic,
          certificateId,
          currentBlockHeight,
        );
        // 凭证已经被销毁
        if (memCertificate.status === ASSET_STATUS.DESTROY) {
          throw new ConsensusException(ERROR_LIST.CERTIFICATE_ALREADY_DESTROY, {
            certificateId,
          });
        }
        if (memCertificate.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.CERTIFICATE_ALREADY_FROZEN, {
            certificateId,
          });
        }
        if (memCertificate.possessorAddress !== address) {
          throw new ConsensusException(ERROR_LIST.ACCOUNT_NOT_CERTIFICATE_POSSESSOR, {
            address,
            certificateId,
            errorId: NewTransactionRefuseReason.ACCOUNT_NOT_CERTIFICATE_POSSESSOR,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/frozenCertificate` },
    );
  }

  private __listenEventUnfrozenCertificate(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 解冻位名，更换拥有者
    eventEmitter.on(
      "unfrozenCertificate",
      async ({ transaction, applyInfo }, next) => {
        const { address, sourceChainName, sourceChainMagic, certificateId, frozenId } = applyInfo;

        // 凭证是否存在
        const memCertificate = await this.helperLogicVerifier.isCertificateExist(
          sourceChainName,
          sourceChainMagic,
          certificateId,
          currentBlockHeight,
        );
        // 凭证已经被销毁
        if (memCertificate.status === ASSET_STATUS.DESTROY) {
          throw new ConsensusException(ERROR_LIST.CERTIFICATE_ALREADY_DESTROY, {
            certificateId,
          });
        }
        // 位名尚未冻结
        if (memCertificate.status !== ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.CERTIFICATE_NOT_FROZEN, {
            certificateId,
          });
        }
        // 冻结 id 不匹配
        if (memCertificate.frozenId !== frozenId) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `frozenId ${frozenId}`,
            to_target: "transaction",
            be_compare_prop: `certificate frozenId ${memCertificate.frozenId}`,
          });
        }
        // if (memCertificate.possessorAddress === address) {
        //   throw new ConsensusException(ERROR_LIST.NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
        //     type: "certificate",
        //     asset: certificateId,
        //   });
        // }
        if (transaction.recipientId !== memCertificate.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `recipientId ${transaction.recipientId}`,
            to_target: "transaction",
            be_compare_prop: `Certificate possessor ${memCertificate.possessorAddress}`,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/unfrozenCertificate` },
    );
  }

  private __listenEventChangeCertificatePossessor(
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    // 更改凭证的拥有者
    eventEmitter.on(
      "changeCertificatePossessor",
      async ({ transaction, applyInfo }, next) => {
        const { address, possessorAddress, sourceChainName, sourceChainMagic, certificateId } =
          applyInfo;

        if (address !== possessorAddress) {
          // 不能将冻结账户设置为凭证的拥有者
          await this.helperLogicVerifier.isAccountFrozen(possessorAddress);
        }
        // 凭证是否存在
        const memCertificate = await this.helperLogicVerifier.isCertificateExist(
          sourceChainName,
          sourceChainMagic,
          certificateId,
          currentBlockHeight,
        );
        // 凭证已经被销毁
        if (memCertificate.status === ASSET_STATUS.DESTROY) {
          throw new ConsensusException(ERROR_LIST.CERTIFICATE_ALREADY_DESTROY, {
            certificateId,
          });
        }
        // 处于冻结状态的凭证不能更改拥有者
        if (memCertificate.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(ERROR_LIST.CERTIFICATE_ALREADY_FROZEN, {
            certificateId,
          });
        }
        // 凭证的拥有者才能更改拥有者
        if (transaction.senderId !== memCertificate.possessorAddress) {
          throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `senderId ${transaction.senderId}`,
            to_target: "transaction",
            be_compare_prop: `Certificate possessor ${memCertificate.possessorAddress}`,
          });
        }

        return next();
      },
      { taskname: `applyTransaction/logicVerifier/changeCertificatePossessor` },
    );
  }

  listenEvent(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    currentBlockHeight: number,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    this.__listenEventFee(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventDestroyMainAsset(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventAsset(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventFrozenAsset(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventUnfrozenAsset(currentBlockHeight, eventEmitter);
    this.__listenEventSignForAsset(currentBlockHeight, eventEmitter);
    this.__listenEventFrozenAccount(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventSetSecondPublicKey(eventEmitter);
    this.__listenEventIssueAsset(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventDestroyAsset(eventEmitter);
    this.__listenEventIssueDAppid(currentBlockHeight, eventEmitter);
    this.__listenEventFrozenDAppid(currentBlockHeight, eventEmitter);
    this.__listenEventUnfrozenDAppid(currentBlockHeight, eventEmitter);
    this.__listenEventChangeDAppidPossessor(currentBlockHeight, eventEmitter);
    this.__listenEventRegisterChain(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventRegisterLocationName(currentBlockHeight, eventEmitter);
    this.__listenEventCancelLocationName(currentBlockHeight, eventEmitter);
    this.__listenEventSetLnsManager(currentBlockHeight, eventEmitter);
    this.__listenEventSetLnsRecordValue(currentBlockHeight, eventEmitter);
    this.__listenEventFrozenLocationName(currentBlockHeight, eventEmitter);
    this.__listenEventUnfrozenLocationName(currentBlockHeight, eventEmitter);
    this.__listenEventChangeLocationNamePossessor(currentBlockHeight, eventEmitter);
    this.__listenEventIssueEntityFactoryByFrozen(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventIssueEntityFactoryByDestroy(currentBlockHeight, eventEmitter);
    this.__listenEventIssueEntity(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventIssueEntityV1(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventIssueEntityMultiV1(accountMap, currentBlockHeight, eventEmitter);
    this.__listenEventDestroyEntity(currentBlockHeight, eventEmitter);
    this.__listenEventFrozenEntity(currentBlockHeight, eventEmitter);
    this.__listenEventUnfrozenEntity(currentBlockHeight, eventEmitter);
    this.__listenEventChangeEntityPossessor(currentBlockHeight, eventEmitter);
    this.__listenEventMigrateCertificate(eventEmitter);
    this.__listenEventPayTax(currentBlockHeight, eventEmitter);
    this.__listenEventIssueCertificate(currentBlockHeight, eventEmitter);
    this.__listenEventDestroyCertificate(currentBlockHeight, eventEmitter);
    this.__listenEventFrozenCertificate(currentBlockHeight, eventEmitter);
    this.__listenEventUnfrozenCertificate(currentBlockHeight, eventEmitter);
    this.__listenEventChangeCertificatePossessor(currentBlockHeight, eventEmitter);
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

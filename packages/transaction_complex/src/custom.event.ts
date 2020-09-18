import {
  CoreExceptionGenerator,
  PROP_IS_INVALID,
  NOT_EXIST,
  PROP_IS_REQUIRE,
  SHOULD_NOT_EXIST,
  SHOULD_BE,
} from "@bfchain/core-util-exception";
import { parseHexToArrayBuffer, Injectable, Inject } from "@bfchain/util";
import {
  ACCOUNT_STATUS,
  CustomTransaction,
  RECORD_TYPE,
  DAPP_TYPE,
  RECORD_OPERATION_TYPE,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  BaseHelper,
  ConfigHelper,
  TransactionHelper,
  ChainAssetInfoHelper,
  ConfigHelperMap,
} from "@bfchain/core-helper";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "CustomTransactionEvent");

@Injectable()
export class CustomTransactionEvent {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public transactionHelper: TransactionHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private configMap: ConfigHelperMap,
  ) {}

  async verifyAddress(address: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyAddress",
    } as const;
    if (!(await this.accountBaseHelper.isAddress(address))) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "address",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyPublicKey(publicKey: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyPublicKey",
    } as const;
    if (!this.baseHelper.isValidPublicKey(publicKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "publicKey",
        ...Function_Exception_Detail,
      });
    }
  }

  async verifyRecipientId(recipientId: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyRecipientId",
    } as const;
    if (!(await this.accountBaseHelper.isAddress(recipientId))) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }
  }

  async verifyPossessorAddress(possessorAddress: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyPossessorAddress",
    } as const;
    if (!(await this.accountBaseHelper.isAddress(possessorAddress))) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "possessorAddress",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyAssetNumber(assetNumber: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyPublicKey",
    } as const;
    if (!this.baseHelper.isValidAssetNumber(assetNumber)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "amount",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyMagic(magic: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyMagic",
    } as const;
    if (!this.baseHelper.isValidChainMagic(magic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "magic",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyAssetType(assetType: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyAssetType",
    } as const;
    if (!this.baseHelper.isValidAssetType(assetType)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "assetType",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyChainName(chainName: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyChainName",
    } as const;
    if (!this.baseHelper.isValidChainName(chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "chainName",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyDAppid(dappid: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyDAppid",
    } as const;
    if (!this.baseHelper.isValidDAppId(dappid)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "dappid",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyMinAndMaxEffectiveHeight(
    minEffectiveHeight: number,
    maxEffectiveHeight: number,
    transaction: CustomTransaction,
  ) {
    const { transactionHelper } = this;
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyMinAndMaxEffectiveHeight",
    } as const;
    const calMinEffectiveHeight = transactionHelper.getTransactionMinEffectiveHeight(transaction);
    if (minEffectiveHeight !== calMinEffectiveHeight) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "minEffectiveHeight",
        ...Function_Exception_Detail,
      });
    }
    const calMaxEffectiveHeight = transactionHelper.getTransactionMaxEffectiveHeight(transaction);
    if (maxEffectiveHeight !== calMaxEffectiveHeight) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxEffectiveHeight",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyLocationName(lns: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyLocationName",
    } as const;
    if (!this.baseHelper.isValidLnsName(lns)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "locationName",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验解析值是否合法
   *
   * @param record
   */
  async verifyLocationNameRecord(record: BFChainCore.LocationNameRecordJSON) {
    const { baseHelper, accountBaseHelper } = this;
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyLocationNameRecord",
    } as const;

    if (!baseHelper.isValidLocationNameRecord(record)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "record",
        type: "location name record",
        ...Function_Exception_Detail,
      });
    }

    const { recordType, recordValue } = record;

    if (RECORD_TYPE.IPV4 === recordType) {
      if (!baseHelper.isIpV4(recordValue)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "recordValue",
          type: "ipv4",
          ...Function_Exception_Detail,
        });
      }
    } else if (RECORD_TYPE.IPV6 === recordType) {
      if (!baseHelper.isIpV6(recordValue)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "recordValue",
          type: "ipv6",
          ...Function_Exception_Detail,
        });
      }
    } else if (RECORD_TYPE.LNG_LAT === recordType) {
      if (!baseHelper.isString(recordValue)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "recordValue",
          type: "string",
          ...Function_Exception_Detail,
        });
      }
    } else if (RECORD_TYPE.ADDRESSV1 === recordType) {
      if (!(await accountBaseHelper.isAddress(recordValue))) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "recordValue",
          type: "block chain account address",
          ...Function_Exception_Detail,
        });
      }
    } else {
      throw new ArgumentIllegalException(NOT_EXIST, {
        prop: "recordType",
        ...Function_Exception_Detail,
      });
    }
  }

  async verifyApplyResult(
    applyResult: BFChainCore.ApplyResultJSON,
    transaction: CustomTransaction,
  ) {
    const { baseHelper, accountBaseHelper, transactionHelper } = this;
    const Function_Exception_Detail = {
      target: "applyResult",
      function: "verifyApplyResult",
    } as const;
    const { address, publicKey } = applyResult.applyInfo;
    await this.verifyAddress(address);
    if (publicKey) {
      this.verifyPublicKey(publicKey);
    }

    if (applyResult.type === "setSecondPublicKey") {
      const { secondPublicKey } = applyResult.applyInfo;
      if (!baseHelper.isValidSecondPublicKey(secondPublicKey)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "secondPublicKey",
          ...Function_Exception_Detail,
        });
      }
      return;
    }

    if (applyResult.type === "setUsername") {
      const applyInfo = applyResult.applyInfo;
      if (!baseHelper.isValidUsername(applyInfo.alias)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "alias",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (
      applyResult.type === "registerToDelegate" ||
      applyResult.type === "acceptVote" ||
      applyResult.type === "rejectVote"
    ) {
      return;
    }
    if (applyResult.type === "voteEquity") {
      const { equity, recipientId } = applyResult.applyInfo;
      if (!baseHelper.isValidAccountEquity(equity)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "voteEquity",
          ...Function_Exception_Detail,
        });
      }
      await this.verifyRecipientId(recipientId);
      return;
    }
    if (applyResult.type === "asset") {
      const { magic, assetType, amount, action } = applyResult.applyInfo;
      this.verifyAssetNumber(amount);
      this.verifyMagic(magic);
      this.verifyAssetType(assetType);
      if (!(action === "+" || action === "-")) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "action",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "destoryAsset") {
      const { magic, assetType, amount } = applyResult.applyInfo;
      this.verifyAssetNumber(amount);
      this.verifyMagic(magic);
      this.verifyAssetType(assetType);
      return;
    }
    if (applyResult.type === "frozenAsset") {
      const {
        magic,
        assetType,
        amount,
        minEffectiveHeight,
        maxEffectiveHeight,
      } = applyResult.applyInfo;
      this.verifyAssetNumber(amount);
      this.verifyMagic(magic);
      this.verifyAssetType(assetType);
      this.verifyMinAndMaxEffectiveHeight(minEffectiveHeight, maxEffectiveHeight, transaction);
      return;
    }
    if (applyResult.type === "unfrozenAsset") {
      const { magic, assetType, amount, frozenId, recipientId } = applyResult.applyInfo;
      this.verifyAssetNumber(amount);
      this.verifyMagic(magic);
      this.verifyAssetType(assetType);
      await this.verifyRecipientId(recipientId);
      if (
        !(
          transaction.storage &&
          transaction.storage.key === "transactionSignature" &&
          transaction.storage.value === frozenId
        )
      ) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "frozenId",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "frozenAccount") {
      const { accountStatus } = applyResult.applyInfo;
      if (!ACCOUNT_STATUS[accountStatus]) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "accountStatus",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "issueDAppid") {
      const {
        sourceChainName,
        sourceChainMagic,
        dappid,
        possessorAddress,
        type,
        purchaseAsset,
      } = applyResult.applyInfo;
      this.verifyMagic(sourceChainMagic);
      this.verifyChainName(sourceChainName);
      await this.verifyPossessorAddress(possessorAddress);
      this.verifyDAppid(dappid);
      if (!DAPP_TYPE[type]) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "type",
          ...Function_Exception_Detail,
        });
      }
      if (purchaseAsset) {
        const { sourceChainMagic, sourceChainName, assetType, amount } = purchaseAsset;
        this.verifyMagic(sourceChainMagic);
        this.verifyChainName(sourceChainName);
        this.verifyAssetType(assetType);
        this.verifyAssetNumber(amount);
      }
      return;
    }
    if (applyResult.type === "saleDAppid") {
      const {
        dappid,
        sourceChainMagic,
        minEffectiveHeight,
        maxEffectiveHeight,
      } = applyResult.applyInfo;
      this.verifyDAppid(dappid);
      this.verifyMagic(sourceChainMagic);
      this.verifyMinAndMaxEffectiveHeight(minEffectiveHeight, maxEffectiveHeight, transaction);
      return;
    }
    if (applyResult.type === "purchaseDAppid") {
      const { dappid, possessorAddress, sourceChainMagic } = applyResult.applyInfo;
      this.verifyDAppid(dappid);
      this.verifyMagic(sourceChainMagic);
      await this.verifyPossessorAddress(possessorAddress);
      return;
    }
    if (applyResult.type === "issueAsset") {
      const {
        applyAddress,
        sourceChainName,
        sourceChainMagic,
        assetType,
        genesisAddress,
        expectedIssuedAssets,
        remainAssets,
      } = applyResult.applyInfo;
      this.verifyMagic(sourceChainMagic);
      this.verifyChainName(sourceChainName);
      this.verifyAssetType(assetType);
      if (!(await accountBaseHelper.isAddress(applyAddress))) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "applyAddress",
          ...Function_Exception_Detail,
        });
      }
      if (!(await accountBaseHelper.isAddress(genesisAddress))) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "genesisAddress",
          ...Function_Exception_Detail,
        });
      }
      if (!baseHelper.isValidAssetNumber(expectedIssuedAssets)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "expectedIssuedAssets",
          ...Function_Exception_Detail,
        });
      }
      if (!baseHelper.isValidAssetNumber(remainAssets)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "remainAssets",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "registerChain") {
      const { genesisBlock: genesisBlockJson } = applyResult.applyInfo;
      let chainConfig = this.configMap.get(genesisBlockJson.magic);
      if (!chainConfig) {
        // FIXME: 没有注册链的配置文件就生成一个
        chainConfig = new ConfigHelper(genesisBlockJson, this.configHelper.business);
      }

      const genesisBlock = await this._blockCore.recombineBlock(genesisBlockJson);
      await this._blockCore
        .getBlockFactoryFromHeight<BFChainCore.Block<BFChainCore.GenesisBlockRemarkJSON>>(
          genesisBlock.height,
        )
        .verify(genesisBlock, chainConfig);
    }
    if (applyResult.type === "registerLocationName") {
      const { sourceChainName, sourceChainMagic, name, possessorAddress } = applyResult.applyInfo;
      this.verifyMagic(sourceChainMagic);
      this.verifyChainName(sourceChainName);
      await this.verifyPossessorAddress(possessorAddress);
      this.verifyLocationName(name);
      return;
    }
    if (applyResult.type === "cancelLocationName") {
      const { address, sourceChainMagic, name, possessorAddress } = applyResult.applyInfo;
      this.verifyMagic(sourceChainMagic);
      await this.verifyPossessorAddress(possessorAddress);
      this.verifyLocationName(name);
      if (address !== possessorAddress) {
        throw new ArgumentIllegalException(SHOULD_BE, {
          to_compare_prop: "possessorAddress",
          to_target: address,
          be_compare_prop: "applyInfo",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "setLnsRecordValue") {
      const {
        name,
        sourceChainMagic,
        operationType,
        addRecord,
        deleteRecord,
      } = applyResult.applyInfo;
      this.verifyLocationName(name);
      this.verifyMagic(sourceChainMagic);
      if (operationType === RECORD_OPERATION_TYPE.ADD) {
        if (!addRecord) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "addRecord",
            ...Function_Exception_Detail,
          });
        }
        if (deleteRecord) {
          throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
            prop: "deleteRecord",
            ...Function_Exception_Detail,
          });
        }
        await this.verifyLocationNameRecord(addRecord);
      } else if (operationType === RECORD_OPERATION_TYPE.DELETE) {
        if (addRecord) {
          throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
            prop: "addRecord",
            ...Function_Exception_Detail,
          });
        }
        if (!deleteRecord) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "deleteRecord",
            ...Function_Exception_Detail,
          });
        }
        await this.verifyLocationNameRecord(deleteRecord);
      } else if (operationType === RECORD_OPERATION_TYPE.UPDATE) {
        if (!addRecord) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "addRecord",
            ...Function_Exception_Detail,
          });
        }
        if (!deleteRecord) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "deleteRecord",
            ...Function_Exception_Detail,
          });
        }
        await this.verifyLocationNameRecord(addRecord);
        await this.verifyLocationNameRecord(deleteRecord);
      } else {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "operationType",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "saleLocationName") {
      const {
        name,
        sourceChainMagic,
        minEffectiveHeight,
        maxEffectiveHeight,
      } = applyResult.applyInfo;
      this.verifyLocationName(name);
      this.verifyMagic(sourceChainMagic);
      this.verifyMinAndMaxEffectiveHeight(minEffectiveHeight, maxEffectiveHeight, transaction);
      return;
    }
    if (applyResult.type === "purchaseLocationName") {
      const { possessorAddress, name, sourceChainMagic } = applyResult.applyInfo;
      await this.verifyPossessorAddress(possessorAddress);
      this.verifyLocationName(name);
      this.verifyMagic(sourceChainMagic);
      return;
    }
    throw new ArgumentIllegalException(PROP_IS_INVALID, {
      prop: "type",
      ...Function_Exception_Detail,
    });
  }

  @Inject("bfchain-core:BlockCore")
  private _blockCore!: import("@bfchain/core-block").BlockCore;

  combineApplyEvent(
    transaction: CustomTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    applyResult: BFChainCore.ApplyResultJSON,
  ) {
    if (applyResult.type === "setUsername") {
      const { address, publicKey, alias } = applyResult.applyInfo;
      return eventEmitter.emit("setUsername", {
        type: "setUsername",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          alias,
        },
      });
    }
    if (applyResult.type === "setSecondPublicKey") {
      const { address, publicKey, secondPublicKey } = applyResult.applyInfo;
      return eventEmitter.emit("setSecondPublicKey", {
        type: "setSecondPublicKey",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          secondPublicKeyBuffer: parseHexToArrayBuffer(secondPublicKey),
        },
      });
    }
    if (applyResult.type === "registerToDelegate") {
      const { address, publicKey } = applyResult.applyInfo;
      return eventEmitter.emit("registerToDelegate", {
        type: "registerToDelegate",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
        },
      });
    }
    if (applyResult.type === "acceptVote") {
      const { address, publicKey } = applyResult.applyInfo;
      return eventEmitter.emit("acceptVote", {
        type: "acceptVote",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
        },
      });
    }
    if (applyResult.type === "rejectVote") {
      const { address, publicKey } = applyResult.applyInfo;
      return eventEmitter.emit("rejectVote", {
        type: "rejectVote",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
        },
      });
    }
    if (applyResult.type === "voteEquity") {
      const { address, publicKey, equity, recipientId } = applyResult.applyInfo;
      return eventEmitter.emit("voteEquity", {
        type: "voteEquity",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          equity: "-" + equity,
          sourceEquity: equity,
          recipientId,
        },
      });
    }
    if (applyResult.type === "asset") {
      const { address, publicKey, magic, assetType, amount, action } = applyResult.applyInfo;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(magic, assetType);
      return eventEmitter.emit("asset", {
        type: "asset",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: publicKey ? parseHexToArrayBuffer(publicKey) : undefined,
          assetInfo,
          amount: action === "-" ? "-" + amount : amount,
          sourceAmount: amount,
        },
      });
    }
    if (applyResult.type === "destoryAsset") {
      const {
        address,
        publicKey,
        magic,
        assetType,
        amount,
        assetsApplyAddress,
      } = applyResult.applyInfo;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(magic, assetType);
      return eventEmitter.emit("destoryAsset", {
        type: "destoryAsset",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          assetsApplyAddress,
          assetInfo,
          amount,
          sourceAmount: amount,
        },
      });
    }
    if (applyResult.type === "frozenAsset") {
      const {
        address,
        publicKey,
        magic,
        assetType,
        amount,
        minEffectiveHeight,
        maxEffectiveHeight,
        totalUnfrozenTimes,
      } = applyResult.applyInfo;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(magic, assetType);
      return eventEmitter.emit("frozenAsset", {
        type: "frozenAsset",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          assetInfo,
          amount: `-${amount}`,
          sourceAmount: amount,
          frozenIdBuffer: transaction.signatureBuffer,
          minEffectiveHeight,
          maxEffectiveHeight,
          totalUnfrozenTimes,
        },
      });
    }
    if (applyResult.type === "unfrozenAsset") {
      const {
        address,
        publicKey,
        magic,
        assetType,
        amount,
        frozenId,
        recipientId,
      } = applyResult.applyInfo;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(magic, assetType);
      return eventEmitter.emit("unfrozenAsset", {
        type: "unfrozenAsset",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          assetInfo,
          amount,
          sourceAmount: amount,
          frozenIdBuffer: parseHexToArrayBuffer(frozenId),
          recipientId,
        },
      });
    }
    if (applyResult.type === "frozenAccount") {
      const { address, publicKey, accountStatus } = applyResult.applyInfo;
      return eventEmitter.emit("frozenAccount", {
        type: "frozenAccount",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          accountStatus,
        },
      });
    }
    if (applyResult.type === "issueDAppid") {
      const {
        address,
        publicKey,
        sourceChainName,
        sourceChainMagic,
        dappid,
        type,
        purchaseAsset,
        possessorAddress,
      } = applyResult.applyInfo;
      return eventEmitter.emit("issueDAppid", {
        type: "issueDAppid",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          sourceChainName,
          sourceChainMagic,
          dappid,
          possessorAddress,
          type,
          purchaseAsset,
        },
      });
    }
    if (applyResult.type === "saleDAppid") {
      const {
        address,
        dappid,
        sourceChainMagic,
        minEffectiveHeight,
        maxEffectiveHeight,
      } = applyResult.applyInfo;
      return eventEmitter.emit("saleDAppid", {
        type: "saleDAppid",
        transaction,
        applyInfo: {
          address,
          sourceChainMagic,
          dappid,
          minEffectiveHeight,
          maxEffectiveHeight,
        },
      });
    }
    if (applyResult.type === "purchaseDAppid") {
      const {
        address,
        publicKey,
        dappid,
        sourceChainMagic,
        possessorAddress,
      } = applyResult.applyInfo;
      return eventEmitter.emit("purchaseDAppid", {
        type: "purchaseDAppid",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          sourceChainMagic,
          dappid,
          possessorAddress,
        },
      });
    }
    if (applyResult.type === "issueAsset") {
      const {
        address,
        publicKey,
        sourceChainName,
        sourceChainMagic,
        assetType,
        genesisAddress,
        expectedIssuedAssets,
      } = applyResult.applyInfo;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
      return eventEmitter.emit("issueAsset", {
        type: "issueAsset",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          sourceChainName,
          genesisAddress,
          assetInfo,
          amount: expectedIssuedAssets,
          sourceAmount: expectedIssuedAssets,
        },
      });
    }
    if (applyResult.type === "registerChain") {
      const { address, publicKey, genesisBlock } = applyResult.applyInfo;

      return eventEmitter.emit("registerChain", {
        type: "registerChain",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          genesisBlock,
        },
      });
    }
    if (applyResult.type === "registerLocationName") {
      const {
        address,
        publicKey,
        name,
        sourceChainMagic,
        sourceChainName,
        possessorAddress,
      } = applyResult.applyInfo;
      return eventEmitter.emit("registerLocationName", {
        type: "registerLocationName",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          name,
          sourceChainMagic,
          sourceChainName,
          possessorAddress,
        },
      });
    }
    if (applyResult.type === "cancelLocationName") {
      const {
        address,
        publicKey,
        name,
        sourceChainMagic,
        possessorAddress,
      } = applyResult.applyInfo;
      return eventEmitter.emit("cancelLocationName", {
        type: "cancelLocationName",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          name,
          sourceChainMagic,
          possessorAddress,
        },
      });
    }
    if (applyResult.type === "setLnsManager") {
      const { address, publicKey, name, sourceChainMagic, manager } = applyResult.applyInfo;
      return eventEmitter.emit("setLnsManager", {
        type: "setLnsManager",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          name,
          sourceChainMagic,
          manager,
        },
      });
    }
    if (applyResult.type === "setLnsRecordValue") {
      const {
        address,
        publicKey,
        name,
        sourceChainMagic,
        operationType,
        addRecord,
        deleteRecord,
      } = applyResult.applyInfo;
      return eventEmitter.emit("setLnsRecordValue", {
        type: "setLnsRecordValue",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          name,
          sourceChainMagic,
          operationType,
          addRecord,
          deleteRecord,
        },
      });
    }
    if (applyResult.type === "saleLocationName") {
      const {
        address,
        name,
        sourceChainMagic,
        minEffectiveHeight,
        maxEffectiveHeight,
      } = applyResult.applyInfo;
      return eventEmitter.emit("saleLocationName", {
        type: "saleLocationName",
        transaction,
        applyInfo: {
          address,
          sourceChainMagic,
          name,
          minEffectiveHeight,
          maxEffectiveHeight,
        },
      });
    }
    if (applyResult.type === "purchaseLocationName") {
      const {
        address,
        publicKey,
        name,
        sourceChainMagic,
        possessorAddress,
      } = applyResult.applyInfo;
      return eventEmitter.emit("purchaseLocationName", {
        type: "purchaseLocationName",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          sourceChainMagic,
          name,
          possessorAddress,
        },
      });
    }
    throw new ArgumentIllegalException(PROP_IS_INVALID, {
      prop: "eventType",
      target: "applyResult",
      function: "combineApplyEvent",
    });
  }
}

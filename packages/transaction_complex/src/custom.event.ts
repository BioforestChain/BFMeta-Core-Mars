import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { getHexFromArrayBuffer, parseHexToArrayBuffer, Injectable, Inject } from "@bfchain/util";
import {
  ACCOUNT_STATUS,
  CustomTransaction,
  RECORD_TYPE,
  DAPP_TYPE,
  RECORD_OPERATION_TYPE,
  ASSET_STATUS,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  BaseHelper,
  ConfigHelper,
  TransactionHelper,
  ChainAssetInfoHelper,
  ConfigHelperMap,
  RegisterChainCertificateHelper,
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
    public registerChainCertificateHelper: RegisterChainCertificateHelper,
    private configMap: ConfigHelperMap,
  ) {}

  async verifyAddress(address: string) {
    const Function_Exception_Detail = {
      target: "applyResult",
    } as const;
    if (!(await this.accountBaseHelper.isAddress(address))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "address",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyPublicKey(publicKey: string) {
    if (!this.baseHelper.isValidPublicKey(publicKey)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "publicKey",
        target: "applyResult",
      });
    }
  }

  async verifyFrozenAddress(frozenAddress: string) {
    if (!(await this.accountBaseHelper.isAddress(frozenAddress))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "frozenAddress",
        target: "applyResult",
      });
    }
  }

  async verifyRecipientId(recipientId: string) {
    if (!(await this.accountBaseHelper.isAddress(recipientId))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "recipientId",
        target: "applyResult",
      });
    }
  }

  async verifyPossessorAddress(possessorAddress: string) {
    if (!(await this.accountBaseHelper.isAddress(possessorAddress))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "possessorAddress",
        target: "applyResult",
      });
    }
  }

  verifyAssetNumber(assetNumber: string) {
    if (!this.baseHelper.isValidAssetNumber(assetNumber)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "amount",
        target: "applyResult",
      });
    }
  }

  verifyMagic(magic: string) {
    if (!this.baseHelper.isValidChainMagic(magic)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "magic",
        target: "applyResult",
      });
    }
  }

  verifyAssetType(assetType: string) {
    if (!this.baseHelper.isValidAssetType(assetType)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "assetType",
        target: "applyResult",
      });
    }
  }

  verifyChainName(chainName: string) {
    if (!this.baseHelper.isValidChainName(chainName)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "chainName",
        target: "applyResult",
      });
    }
  }

  verifyDAppid(dappid: string) {
    if (!this.baseHelper.isValidDAppId(dappid)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "dappid",
        target: "applyResult",
      });
    }
  }

  verifyMinAndMaxEffectiveHeight(
    minEffectiveHeight: number,
    maxEffectiveHeight: number,
    transaction: CustomTransaction,
  ) {
    const { transactionHelper } = this;

    const calMinEffectiveHeight = transactionHelper.getTransactionMinEffectiveHeight(transaction);
    if (minEffectiveHeight !== calMinEffectiveHeight) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "minEffectiveHeight",
        target: "applyResult",
      });
    }
    const calMaxEffectiveHeight = transactionHelper.getTransactionMaxEffectiveHeight(transaction);
    if (maxEffectiveHeight !== calMaxEffectiveHeight) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "maxEffectiveHeight",
        target: "applyResult",
      });
    }
  }

  verifyLocationName(lns: string) {
    if (!this.baseHelper.isValidLocationName(lns)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "locationName",
        target: "applyResult",
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
    } as const;
    const { address, publicKey } = applyResult.applyInfo;
    await this.verifyAddress(address);
    if (publicKey) {
      this.verifyPublicKey(publicKey);
    }

    if (applyResult.type === "setSecondPublicKey") {
      const { secondPublicKey } = applyResult.applyInfo;
      if (!baseHelper.isValidSecondPublicKey(secondPublicKey)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "secondPublicKey",
          ...Function_Exception_Detail,
        });
      }
      return;
    }

    if (applyResult.type === "setUsername") {
      const applyInfo = applyResult.applyInfo;
      if (!baseHelper.isValidUsername(applyInfo.alias)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
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
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
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
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
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
      const { magic, assetType, amount, minEffectiveHeight, maxEffectiveHeight } =
        applyResult.applyInfo;
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
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "frozenId",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "signForAsset") {
      const { frozenId, frozenAddress, recipientId } = applyResult.applyInfo;
      await this.verifyFrozenAddress(frozenAddress);
      await this.verifyRecipientId(recipientId);
      if (
        !(
          transaction.storage &&
          transaction.storage.key === "transactionSignature" &&
          transaction.storage.value === frozenId
        )
      ) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "frozenId",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "frozenAccount") {
      const { accountStatus } = applyResult.applyInfo;
      if (
        accountStatus !== ACCOUNT_STATUS.NORMAL &&
        accountStatus !== ACCOUNT_STATUS.FROZEN_IN &&
        accountStatus !== ACCOUNT_STATUS.FROZEN_OUT &&
        accountStatus !== ACCOUNT_STATUS.FROZEN_IN_AND_OUT
      ) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "accountStatus",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "issueDAppid") {
      const { sourceChainName, sourceChainMagic, dappid, possessorAddress, type, purchaseAsset } =
        applyResult.applyInfo;
      this.verifyMagic(sourceChainMagic);
      this.verifyChainName(sourceChainName);
      await this.verifyPossessorAddress(possessorAddress);
      this.verifyDAppid(dappid);
      if (type !== DAPP_TYPE.FREE_APP && type !== DAPP_TYPE.PAID_APP) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "type",
          ...Function_Exception_Detail,
        });
      }
      if (purchaseAsset) {
        this.verifyAssetNumber(purchaseAsset);
      }
      return;
    }
    if (applyResult.type === "frozenDAppid") {
      const { dappid, sourceChainMagic, minEffectiveHeight, maxEffectiveHeight } =
        applyResult.applyInfo;
      this.verifyDAppid(dappid);
      this.verifyMagic(sourceChainMagic);
      this.verifyMinAndMaxEffectiveHeight(minEffectiveHeight, maxEffectiveHeight, transaction);
      return;
    }
    if (applyResult.type === "unfrozenDAppid") {
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
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "applyAddress",
          ...Function_Exception_Detail,
        });
      }
      if (!(await accountBaseHelper.isAddress(genesisAddress))) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "genesisAddress",
          ...Function_Exception_Detail,
        });
      }
      if (!baseHelper.isValidAssetNumber(expectedIssuedAssets)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "expectedIssuedAssets",
          ...Function_Exception_Detail,
        });
      }
      if (!baseHelper.isValidAssetNumber(remainAssets)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "remainAssets",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "registerChain") {
      const config = this.configHelper;
      const genesisBlockString = applyResult.applyInfo.genesisBlock;
      if (!this.baseHelper.isString(genesisBlockString)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "genesisBlock",
          ...Function_Exception_Detail,
        });
      }
      const certificate = this.registerChainCertificateHelper.decode(genesisBlockString);
      await this.registerChainCertificateHelper.verifyRegisterChainCertificate(certificate);
      const { bnid, magic, assetType, chainName } = certificate.body.genesisBlockInfo;
      if (magic === config.magic) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
          to_compare_prop: `magic ${magic}`,
          to_target: "register genesisBlock",
          be_compare_prop: config.magic,
          ...Function_Exception_Detail,
        });
      }
      if (assetType === config.assetType) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
          to_compare_prop: `assetType ${assetType}`,
          to_target: "register genesisBlock",
          be_compare_prop: config.assetType,
          ...Function_Exception_Detail,
        });
      }
      if (chainName === config.chainName) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
          to_compare_prop: `chainName ${chainName}`,
          to_target: "register genesisBlock",
          be_compare_prop: config.chainName,
          ...Function_Exception_Detail,
        });
      }
      if (config.initials !== bnid) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `initials ${config.initials}`,
          be_compare_prop: `bnid ${bnid}`,
          to_target: "config",
          be_target: "register genesisBlock",
          ...Function_Exception_Detail,
        });
      }
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
      const { address, sourceChainMagic, name } = applyResult.applyInfo;
      this.verifyMagic(sourceChainMagic);
      this.verifyLocationName(name);
      return;
    }
    if (applyResult.type === "setLnsRecordValue") {
      const { name, sourceChainMagic, operationType, addRecord, deleteRecord } =
        applyResult.applyInfo;
      this.verifyLocationName(name);
      this.verifyMagic(sourceChainMagic);
      if (operationType === RECORD_OPERATION_TYPE.ADD) {
        if (!addRecord) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
            prop: "addRecord",
            ...Function_Exception_Detail,
          });
        }
        if (deleteRecord) {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "deleteRecord",
            ...Function_Exception_Detail,
          });
        }
        if (!(await baseHelper.isValidLocationNameRecord(addRecord))) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `addRecord ${JSON.stringify(addRecord)}`,
            ...Function_Exception_Detail,
          });
        }
      } else if (operationType === RECORD_OPERATION_TYPE.DELETE) {
        if (addRecord) {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "addRecord",
            ...Function_Exception_Detail,
          });
        }
        if (!deleteRecord) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
            prop: "deleteRecord",
            ...Function_Exception_Detail,
          });
        }
        if (!(await baseHelper.isValidLocationNameRecord(deleteRecord))) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `deleteRecord ${JSON.stringify(deleteRecord)}`,
            ...Function_Exception_Detail,
          });
        }
      } else if (operationType === RECORD_OPERATION_TYPE.UPDATE) {
        if (!addRecord) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
            prop: "addRecord",
            ...Function_Exception_Detail,
          });
        }
        if (!deleteRecord) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
            prop: "deleteRecord",
            ...Function_Exception_Detail,
          });
        }
        if (!(await baseHelper.isValidLocationNameRecord(addRecord))) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `addRecord ${JSON.stringify(addRecord)}`,
            ...Function_Exception_Detail,
          });
        }
        if (!(await baseHelper.isValidLocationNameRecord(deleteRecord))) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `deleteRecord ${JSON.stringify(deleteRecord)}`,
            ...Function_Exception_Detail,
          });
        }
      } else {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "operationType",
          ...Function_Exception_Detail,
        });
      }
      return;
    }
    if (applyResult.type === "frozenLocationName") {
      const { name, sourceChainMagic, minEffectiveHeight, maxEffectiveHeight } =
        applyResult.applyInfo;
      this.verifyLocationName(name);
      this.verifyMagic(sourceChainMagic);
      this.verifyMinAndMaxEffectiveHeight(minEffectiveHeight, maxEffectiveHeight, transaction);
      return;
    }
    if (applyResult.type === "unfrozenLocationName") {
      const { possessorAddress, name, sourceChainMagic } = applyResult.applyInfo;
      await this.verifyPossessorAddress(possessorAddress);
      this.verifyLocationName(name);
      this.verifyMagic(sourceChainMagic);
      return;
    }
    throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
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
      const { address, publicKey, magic, assetType, amount, assetsApplyAddress } =
        applyResult.applyInfo;
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
      const { address, publicKey, magic, assetType, amount, frozenId, recipientId } =
        applyResult.applyInfo;
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
    if (applyResult.type === "signForAsset") {
      const { address, publicKey, frozenId, frozenAddress, recipientId } = applyResult.applyInfo;
      return eventEmitter.emit("signForAsset", {
        type: "signForAsset",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          frozenIdBuffer: parseHexToArrayBuffer(frozenId),
          frozenAddress,
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
          status: ASSET_STATUS.NORMAL,
        },
      });
    }
    if (applyResult.type === "frozenDAppid") {
      const {
        address,
        dappid,
        sourceChainMagic,
        sourceChainName,
        minEffectiveHeight,
        maxEffectiveHeight,
      } = applyResult.applyInfo;
      return eventEmitter.emit("frozenDAppid", {
        type: "frozenDAppid",
        transaction,
        applyInfo: {
          address,
          sourceChainName,
          sourceChainMagic,
          dappid,
          minEffectiveHeight,
          maxEffectiveHeight,
          status: ASSET_STATUS.FROZEN,
        },
      });
    }
    if (applyResult.type === "unfrozenDAppid") {
      const { address, publicKey, dappid, sourceChainMagic, sourceChainName, possessorAddress } =
        applyResult.applyInfo;
      return eventEmitter.emit("unfrozenDAppid", {
        type: "unfrozenDAppid",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          sourceChainName,
          sourceChainMagic,
          dappid,
          possessorAddress,
          status: ASSET_STATUS.NORMAL,
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
      const certificate = this.registerChainCertificateHelper.decode(genesisBlock);
      const {
        genesisAccount,
        genesisBlockSignature,
        bnid,
        magic,
        assetType,
        chainName,
        genesisDelegates,
      } = certificate.body.genesisBlockInfo;

      return eventEmitter.emit("registerChain", {
        type: "registerChain",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          genesisBlock: {
            bnid,
            magic,
            assetType,
            chainName,
            signature: genesisBlockSignature,
            genesisAccount: genesisAccount,
            genesisDelegates,
          },
        },
      });
    }
    if (applyResult.type === "registerLocationName") {
      const { address, publicKey, name, sourceChainMagic, sourceChainName, possessorAddress } =
        applyResult.applyInfo;
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
          status: ASSET_STATUS.NORMAL,
        },
      });
    }
    if (applyResult.type === "cancelLocationName") {
      const { address, publicKey, name, sourceChainMagic, sourceChainName } = applyResult.applyInfo;
      return eventEmitter.emit("cancelLocationName", {
        type: "cancelLocationName",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          sourceChainName,
          sourceChainMagic,
          name,
          status: ASSET_STATUS.DESTORY,
        },
      });
    }
    if (applyResult.type === "setLnsManager") {
      const { address, publicKey, name, sourceChainMagic, sourceChainName, manager } =
        applyResult.applyInfo;
      return eventEmitter.emit("setLnsManager", {
        type: "setLnsManager",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          sourceChainName,
          sourceChainMagic,
          name,
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
        sourceChainName,
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
          sourceChainName,
          sourceChainMagic,
          name,
          operationType,
          addRecord,
          deleteRecord,
        },
      });
    }
    if (applyResult.type === "frozenLocationName") {
      const {
        address,
        name,
        sourceChainMagic,
        sourceChainName,
        minEffectiveHeight,
        maxEffectiveHeight,
      } = applyResult.applyInfo;
      return eventEmitter.emit("frozenLocationName", {
        type: "frozenLocationName",
        transaction,
        applyInfo: {
          address,
          sourceChainName,
          sourceChainMagic,
          name,
          minEffectiveHeight,
          maxEffectiveHeight,
          status: ASSET_STATUS.FROZEN,
        },
      });
    }
    if (applyResult.type === "unfrozenLocationName") {
      const { address, publicKey, name, sourceChainMagic, sourceChainName, possessorAddress } =
        applyResult.applyInfo;
      return eventEmitter.emit("unfrozenLocationName", {
        type: "unfrozenLocationName",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          sourceChainName,
          sourceChainMagic,
          name,
          possessorAddress,
          status: ASSET_STATUS.NORMAL,
        },
      });
    }
    if (applyResult.type === "frozenEntity") {
      const {
        address,
        entityId,
        sourceChainMagic,
        sourceChainName,
        minEffectiveHeight,
        maxEffectiveHeight,
      } = applyResult.applyInfo;
      return eventEmitter.emit("frozenEntity", {
        type: "frozenEntity",
        transaction,
        applyInfo: {
          address,
          sourceChainName,
          sourceChainMagic,
          entityId,
          minEffectiveHeight,
          maxEffectiveHeight,
          status: ASSET_STATUS.FROZEN,
        },
      });
    }
    if (applyResult.type === "unfrozenEntity") {
      const { address, publicKey, entityId, sourceChainMagic, sourceChainName, possessorAddress } =
        applyResult.applyInfo;
      return eventEmitter.emit("unfrozenEntity", {
        type: "unfrozenEntity",
        transaction,
        applyInfo: {
          address,
          publicKeyBuffer: parseHexToArrayBuffer(publicKey),
          sourceChainName,
          sourceChainMagic,
          entityId,
          possessorAddress,
          status: ASSET_STATUS.NORMAL,
        },
      });
    }
    throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
      prop: "eventType",
      target: "applyResult",
    });
  }
}

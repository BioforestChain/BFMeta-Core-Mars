import { TransactionFactory } from "./_txbase";
import { EmigrateAssetTransaction, ACCOUNT_STATUS } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_BE,
  NOT_MATCH,
  SHOULD_NOT_BE,
  SHOULD_NOT_EXIST,
  PROP_SHOULD_GT_FIELD,
} from "@bfchain/core-util-exception";
import { Injectable, parseHexToArrayBuffer, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "EmigrateAssetTransactionFactory",
);

/**
 * emigrateAsset 交易工厂
 *
 */
@Injectable()
export class EmigrateAssetTransactionFactory extends TransactionFactory<EmigrateAssetTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 emigrateAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收账户地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带生成资产迁出交易的合法数据
   * 需要携带合法的资产所属链名称,并且是本链
   * 需要携带合法的资产所属链的网络标识符,并且是本链
   * 需要携带合法的资产名称，并且是链资产
   * 需要携带迁出的资产数量，并且大于 0
   * 必须携带合法的可验证的本链创世账户的签名和二次签名(创世账户的公钥+签名)
   *
   * @param body
   * @param emigrateAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    emigrateAssetAsset: BFChainCore.EmigrateAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, emigrateAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    if (body.recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic === config.magic) {
      throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.storage) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const { baseHelper, accountBaseHelper } = this;

    const emigrateAsset = emigrateAssetAsset.emigrateAsset;

    if (!emigrateAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "emigrateAsset",
        function: "verifyTransactionBody",
      });
    }

    const EmigrateAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "emigrateAssetAsset",
    } as const;

    const {
      sourceChainMagic,
      sourceChainName,
      assetType,
      amount,
      genesisDelegateSignature,
    } = emigrateAsset;

    this.checkChainName(sourceChainName, "sourceChainName", EmigrateAssetAsset_Exception_Detail);

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: "body",
        be_compare_prop: "local chain name",
        ...EmigrateAssetAsset_Exception_Detail,
      });
    }

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", EmigrateAssetAsset_Exception_Detail);

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `sourceChainMagic ${sourceChainMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...EmigrateAssetAsset_Exception_Detail,
      });
    }

    this.checkAssetType(assetType, "assetType", EmigrateAssetAsset_Exception_Detail);

    if (assetType !== config.assetType) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `assetType ${assetType}`,
        to_target: "body",
        be_compare_prop: "local chain assetType",
        ...EmigrateAssetAsset_Exception_Detail,
      });
    }

    this.checkAssetAmount(amount, "amount", EmigrateAssetAsset_Exception_Detail);

    if (amount === "0") {
      throw new ArgumentIllegalException(PROP_SHOULD_GT_FIELD, {
        prop: "amount",
        fueld: "0",
        ...EmigrateAssetAsset_Exception_Detail,
      });
    }

    if (!genesisDelegateSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisDelegateSignature",
        ...EmigrateAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAccountSignature(genesisDelegateSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `genesisDelegateSignature ${genesisDelegateSignature}`,
        type: "account signature",
        ...EmigrateAssetAsset_Exception_Detail,
      });
    }

    const { publicKey, signature, secondPublicKey, signSignature } = genesisDelegateSignature;
    const address = await accountBaseHelper.getAddressFromPublicKeyString(publicKey);

    const genesisDelegates = this.transactionHelper.genesisDelegates(config);

    const genesisAddress = await this.accountBaseHelper.getAddressFromPublicKeyString(
      this.configHelper.genesisBlock.generatorPublicKey,
    );

    genesisDelegates.push(genesisAddress);

    if (!genesisDelegates.includes(address)) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `signature address ${address}`,
        be_compare_prop: "genesis delegate address",
        to_target: "emigrateAsset",
        be_target: "config",
        ...EmigrateAssetAsset_Exception_Detail,
      });
    }

    const signatureBuffer = parseHexToArrayBuffer(signature);

    if (
      !(await this.transactionHelper.verifyEmigrateAssetGenesisSignature({
        secretPublicKey: parseHexToArrayBuffer(publicKey),
        signatureBuffer,
        chainName: sourceChainName,
        magic: sourceChainMagic,
        assetType,
        senderId: body.senderId,
      }))
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `genesisDelegateSignature ${signature}`,
        type: "signature",
        ...Function_Exception_Detail,
        target: "emigrateAsset",
      });
    }

    if (secondPublicKey && signSignature) {
      if (
        !(await this.transactionHelper.verifyEmigrateAssetGenesisSignature({
          secretPublicKey: parseHexToArrayBuffer(secondPublicKey),
          signatureBuffer: parseHexToArrayBuffer(signSignature),
          chainName: sourceChainName,
          magic: sourceChainMagic,
          assetType,
          senderId: body.senderId,
          genesisSignatureBuffer: signatureBuffer,
        }))
      ) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `genesisDelegateSignSignature ${signSignature}`,
          type: "signature",
          ...Function_Exception_Detail,
          target: "emigrateAsset",
        });
      }
    }
  }

  /**
   * 初始化 emigrateAsset 交易
   *
   * @param body
   * @param emigrateAssetAsset
   */
  init(body: BFChainCore.TxBodyJSON, emigrateAssetAsset: BFChainCore.EmigrateAssetAssetJSON) {
    const transaction = EmigrateAssetTransaction.fromObject({
      ...body,
      asset: emigrateAssetAsset,
    });

    return transaction;
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param transaction
   * @param eventEmitter
   */
  async applyTransaction(
    transaction: EmigrateAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const { senderId, senderPublicKeyBuffer } = transaction;
    // 冻结账户
    tasks.next = eventEmitter.emit("frozenAccount", {
      type: "frozenAccount",
      transaction,
      applyInfo: {
        address: senderId,
        publicKeyBuffer: senderPublicKeyBuffer,
        accountStatus: ACCOUNT_STATUS.FROZEN_IN_AND_OUT,
      },
    });
    return tasks.tryToPromise();
  }
}

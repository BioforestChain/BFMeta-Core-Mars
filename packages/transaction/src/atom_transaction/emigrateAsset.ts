import { TransactionFactory } from "./_txbase";
import { EmigrateAssetTransaction, ACCOUNT_STATUS } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  MigrateCertificateHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  NOT_MATCH,
  PARAM_LOST,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  SHOULD_BE,
  SHOULD_NOT_BE,
  SHOULD_NOT_EXIST,
} from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
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
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public migrateCertificateHelper: MigrateCertificateHelper,
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

    if (!body.recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
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

    if (!body.storage) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }
    const storage = body.storage;
    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "assetType",
        ...Function_Exception_Detail,
      });
    }

    const emigrateAsset = emigrateAssetAsset.emigrateAsset;

    if (!emigrateAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "emigrateAsset",
        function: "verifyTransactionBody",
      });
    }

    if (!emigrateAsset.migrateCertificate) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "migrateCertificate",
        target: "emigrateAsset",
        function: "verifyTransactionBody",
      });
    }
    let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
    try {
      migrateCertificate = JSON.parse(emigrateAsset.migrateCertificate);
    } catch (e) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "migrateCertificate",
        target: "emigrateAsset",
        function: "verifyTransactionBody",
      });
    }

    const converter = await this.migrateCertificateHelper.verifyMigrateCertificate(
      migrateCertificate,
      {
        forceCheckFromChainInfo: true,
        fromChainBaseConfig: {
          chainName: config.chainName,
          magic: config.magic,
          generatorPublicKey: config.generatorPublicKey,
          genesisBlockSignature: config.signature,
          genesisDelegates: this.transactionHelper.genesisDelegates(config),
        },
        forceCheckFromAuthSignature: true,
      },
    );

    if (migrateCertificate.toAuthSignature) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "toAuthSignature",
        ...Function_Exception_Detail,
        target: "aemigrateAsset.migrateCertificate",
      });
    }

    const { toChainId, fromId, toId, assetId } = migrateCertificate.body;
    const fromAddress = converter.fromId.decode(fromId);
    if (body.senderId !== fromAddress) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `senderId ${body.senderId}`,
        be_compare_prop: `fromId ${fromAddress}`,
        to_target: "body",
        be_target: "migrateCertificate",
        ...Function_Exception_Detail,
      });
    }

    const toAddress = converter.toId.decode(toId);
    if (body.recipientId !== toAddress) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `recipientId ${body.recipientId}`,
        be_compare_prop: `toId ${toAddress}`,
        to_target: "body",
        be_target: "migrateCertificate",
        ...Function_Exception_Detail,
      });
    }

    const toChain = converter.toChainId.decode(toChainId);
    if (body.toMagic !== toChain.magic) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        be_compare_prop: `toChainId ${toChain.magic}`,
        to_target: "body",
        be_target: "migrateCertificate",
        ...Function_Exception_Detail,
      });
    }

    const asset = converter.assetId.decode(assetId);
    if (storage.value !== asset.assetType) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `value ${storage.value}`,
        be_compare_prop: `assetTypeId ${asset.assetType}`,
        to_target: "storage",
        be_target: "migrateCertificateBody",
        ...Function_Exception_Detail,
      });
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
  applyTransaction(
    transaction: EmigrateAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, senderPublicKeyBuffer } = transaction;
      // 冻结账户
      taskList.next = eventEmitter.emit("frozenAccount", {
        type: "frozenAccount",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          accountStatus: ACCOUNT_STATUS.FROZEN_IN_AND_OUT,
        },
      });
    });
  }
}

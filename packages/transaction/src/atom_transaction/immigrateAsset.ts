import { TransactionFactory } from "./_txbase";
import { ImmigrateAssetTransaction } from "@bfchain/core-model";
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
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_BE,
  NOT_MATCH,
  SHOULD_NOT_BE,
} from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "ImmigrateAssetTransactionFactory",
);

/**
 * immigrateAsset 交易工厂
 *
 */
@Injectable()
export class ImmigrateAssetTransactionFactory extends TransactionFactory<ImmigrateAssetTransaction> {
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
   * 要验证 immigrateAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收账户地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "transactionSignature" value 必须是 emigrateAsset 的签名
   * 必须携带生成资产迁入交易的合法数据
   * 必须携带完整的可验证的 资产迁出 交易
   * 必须携带合法的可验证的本链创世受托人的签名和二次签名
   *
   * @param body
   * @param migrateAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    immigrateAssetAsset: BFChainCore.ImmigrateAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, immigrateAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper, accountBaseHelper } = this;

    if (!body.recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic === config.magic) {
      throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
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

    const immigrateAsset = immigrateAssetAsset.immigrateAsset;

    if (!immigrateAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "immigrateAsset",
        function: "verifyTransactionBody",
      });
    }

    const ImmigrateAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "migrateAssetAsset",
    } as const;

    const { genesisDelegateSignature, migrateCertificate } = immigrateAsset;

    if (!migrateCertificate) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "migrateCertificate",
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }

    // 验证完整交易包含签名
    const fromChainId = migrateCertificate.fromChainId;
    this.migrateCertificateHelper.verifyFromChainId(fromChainId);
    const fromMagic = fromChainId.split("/")[1];
    if (!baseHelper.isValidChainMagic(fromMagic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `migrateCertificate.fromChainMagic ${fromMagic}`,
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }

    if (!genesisDelegateSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisDelegateSignature",
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAccountSignature(genesisDelegateSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `genesisDelegateSignature ${genesisDelegateSignature}`,
        type: "account signature",
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }

    const { publicKey } = genesisDelegateSignature;
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
        to_target: "immigrateAsset",
        be_target: "config",
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 immigrateAsset 交易
   *
   * @param body
   * @param immigrateAssetAsset
   */
  init(body: BFChainCore.TxBodyJSON, immigrateAssetAsset: BFChainCore.ImmigrateAssetAssetJSON) {
    const transaction = ImmigrateAssetTransaction.fromObject<ImmigrateAssetTransaction>({
      ...body,
      asset: immigrateAssetAsset as any,
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
    transaction: ImmigrateAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const migrateAssetAsset = transaction.asset.immigrateAsset.migrateCertificate;
      const { fromChain, assetType, assets } = migrateAssetAsset;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(fromChain.magic, assetType);
      // 累加资产
      taskList.next = eventEmitter.emit("asset", {
        type: "asset",
        transaction,
        applyInfo: {
          address: transaction.recipientId,
          assetInfo,
          amount: assets,
          sourceAmount: assets,
        },
      });
    });
  }
}

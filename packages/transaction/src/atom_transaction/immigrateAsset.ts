import { TransactionFactory } from "./_txbase";
import { ImmigrateAssetTransaction, PARENT_ASSET_TYPE } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  MigrateCertificateHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
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
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper, accountBaseHelper } = this;

    if (!body.recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic === config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "assetType",
        ...Function_Exception_Detail,
      });
    }

    const immigrateAsset = immigrateAssetAsset.immigrateAsset;

    if (!immigrateAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "immigrateAsset",
      });
    }

    const ImmigrateAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "immigrateAsset",
    } as const;

    if (!immigrateAsset.migrateCertificate) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "migrateCertificate",
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }

    let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
    try {
      migrateCertificate = JSON.parse(immigrateAsset.migrateCertificate);
    } catch (e) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "migrateCertificate",
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }

    // 验证完整交易包含签名
    // const fromChainId = immigrateAsset.body.fromChainId;
    // this.migrateCertificateHelper.verifyFromChainId(fromChainId);
    // const fromMagic = fromChainId.split("/")[1];
    // if (!baseHelper.isValidChainMagic(fromMagic)) {
    //   throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
    //     prop: `migrateCertificate.fromChainMagic ${fromMagic}`,
    //     ...ImmigrateAssetAsset_Exception_Detail,
    //   });
    // }

    const converter = await this.migrateCertificateHelper.verifyMigrateCertificate(
      migrateCertificate,
      {
        forceCheckToChainInfo: true,
        toChainBaseConfig: {
          chainName: config.chainName,
          magic: config.magic,
          generatorPublicKey: config.generatorPublicKey,
          genesisBlockSignature: config.signature,
          genesisDelegates: this.transactionHelper.genesisDelegates(config),
        },
        forceCheckToAuthSignature: true,
        forceCheckFromAuthSignature: true,
      },
    );

    const { fromChainId, toId, assetId } = migrateCertificate.body;
    const toAddress = converter.toId.decode(toId, true);
    if (body.recipientId !== toAddress) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `recipientId ${body.recipientId}`,
        be_compare_prop: `toId ${toAddress}`,
        to_target: "body",
        be_target: "migrateCertificate",
        ...Function_Exception_Detail,
      });
    }

    const fromChain = converter.fromChainId.decode(fromChainId, true);
    if (body.fromMagic !== fromChain.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        be_compare_prop: `fromChainId ${fromChain.magic}`,
        to_target: "body",
        be_target: "migrateCertificate",
        ...Function_Exception_Detail,
      });
    }

    const asset = converter.assetId.decode(assetId, true);
    if (storage.value !== asset.assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `value ${storage.value}`,
        be_compare_prop: `asset ${JSON.stringify(asset)}`,
        to_target: "storage",
        be_target: "migrateCertificate",
        ...Function_Exception_Detail,
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
      let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
      try {
        migrateCertificate = JSON.parse(transaction.asset.immigrateAsset.migrateCertificate);
      } catch (e) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "migrateCertificate",
          target: "transaction.asset.immigrateAsset",
        });
      }
      const converter =
        this.migrateCertificateHelper.getMigrateCertificateConverter(migrateCertificate);
      const { fromChainId, assetId, assetPrealnum } = migrateCertificate.body;
      const fromChain = converter.fromChainId.decode(fromChainId);
      const asset = converter.assetId.decode(assetId);
      const { parentAssetType, assetType } = asset;

      if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        const assetInfo = this.chainAssetInfoHelper.getAssetInfo(fromChain.magic, assetType);
        // 累加资产
        taskList.next = eventEmitter.emit("asset", {
          type: "asset",
          transaction,
          applyInfo: {
            address: transaction.recipientId,
            assetInfo,
            amount: assetPrealnum,
            sourceAmount: assetPrealnum,
          },
        });
      } else {
        // FIXME: 需要时候再完善
        throw new Error(`目前只支持权益`);
      }

      // 记录跨链凭证
      taskList.next = eventEmitter.emit("migrateCertificate", {
        type: "migrateCertificate",
        transaction,
        applyInfo: {
          migrateCertificateId: converter.getUUID(migrateCertificate),
          assetInfo: {
            magic: fromChain.magic,
            assetType,
          },
          assets: assetPrealnum,
          migrateIdBuffer: transaction.signatureBuffer,
        },
      });
    });
  }

  /**
   * 获取变动的权益数
   *
   * @param transaction
   * @param argv
   * @returns
   */
  getMoveAmount(
    transaction: ImmigrateAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
    try {
      migrateCertificate = JSON.parse(transaction.asset.immigrateAsset.migrateCertificate);
    } catch (e) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "migrateCertificate",
        target: "transaction.asset.immigrateAsset",
        function: "getMoveAmount",
      });
    }
    const converter =
      this.migrateCertificateHelper.getMigrateCertificateConverter(migrateCertificate);
    const { fromChainId, assetId, assetPrealnum } = migrateCertificate.body;
    const fromChain = converter.fromChainId.decode(fromChainId);
    const asset = converter.assetId.decode(assetId);
    if (argv.magic === fromChain.magic && argv.assetType === asset.assetType) {
      return assetPrealnum;
    }
    return "0";
  }
}

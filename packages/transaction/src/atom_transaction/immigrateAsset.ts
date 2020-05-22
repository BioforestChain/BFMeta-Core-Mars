import { TransactionFactory } from "./_txbase";
import { ImmigrateAssetTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  ConfigHelperMap,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_BE,
  NOT_MATCH,
  NOT_EXIST,
  SHOULD_NOT_BE,
  SHOULD_NOT_EXIST,
} from "@bfchain/core-util-exception";
import { EmigrateAssetTransactionFactory } from "./emigrateAsset";
import { Injectable, parseHexToArrayBuffer, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "ImmigrateAssetTransactionFactory",
);

/**
 * immigrateAsset 交易工厂
 *
 */
@Injectable()
export class ImmigrateAssetTransactionFactory extends TransactionFactory<
  ImmigrateAssetTransaction
> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private emigrateAssetTransactionFactory: EmigrateAssetTransactionFactory,
    private configMap: ConfigHelperMap,
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

    const { baseHelper, accountBaseHelper, emigrateAssetTransactionFactory } = this;

    if (body.recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic === config.magic) {
      throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        to_compare_prop: "fromMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "toMagic",
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
    if (storage.key !== "transactionSignature") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "transactionSignature",
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

    const { genesisDelegateSignature, emigrateAssetTransaction } = immigrateAsset;

    if (!emigrateAssetTransaction) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "emigrateAssetTransaction",
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }

    // 验证完整交易包含签名
    const emigrateAssetTransactionModel = await emigrateAssetTransactionFactory.fromJSON(
      emigrateAssetTransaction,
    );
    const otherChainConfig = this.configMap.get(emigrateAssetTransactionModel.fromMagic);
    if (!otherChainConfig) {
      throw new ArgumentIllegalException(NOT_EXIST, {
        prop: emigrateAssetTransactionModel.fromMagic,
        ...Function_Exception_Detail,
        target: "configMap",
      });
    }
    await emigrateAssetTransactionFactory.verify(emigrateAssetTransactionModel, otherChainConfig);

    if (!genesisDelegateSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisDelegateSignature",
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAccountSignature(genesisDelegateSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "genesisDelegateSignature",
        type: "account signature",
        ...ImmigrateAssetAsset_Exception_Detail,
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
        to_compare_prop: "signature address",
        be_compare_prop: "genesis delegate address",
        to_target: "immigrateAsset",
        be_target: "config",
        ...ImmigrateAssetAsset_Exception_Detail,
      });
    }

    const signatureBuffer = parseHexToArrayBuffer(signature);

    if (
      !(await this.transactionHelper.verifyImmigrateAssetGenesisSignature({
        secretPublicKey: parseHexToArrayBuffer(publicKey),
        signatureBuffer,
        transactionSignatureBuffer: emigrateAssetTransactionModel.signatureBuffer,
      }))
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "genesisDelegateSignature",
        type: "signature",
        ...Function_Exception_Detail,
        target: "immigrateAsset",
      });
    }

    if (secondPublicKey && signSignature) {
      if (
        !(await this.transactionHelper.verifyImmigrateAssetGenesisSignature({
          secretPublicKey: parseHexToArrayBuffer(secondPublicKey),
          signatureBuffer: parseHexToArrayBuffer(signSignature),
          transactionSignatureBuffer: emigrateAssetTransactionModel.signatureBuffer,
          genesisSignatureBuffer: signatureBuffer,
        }))
      ) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "genesisDelegateSignSignature",
          type: "signature",
          ...Function_Exception_Detail,
          target: "immigrateAsset",
        });
      }
    }

    if (storage.value !== emigrateAssetTransaction.signature) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "value",
        be_compare_prop: "signature",
        to_target: "storage",
        be_target: "emigrateAssetTransaction",
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
    // FIXME: @wmc
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
  async applyTransaction(
    transaction: ImmigrateAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const {
      amount,
      sourceChainMagic,
      assetType,
    } = transaction.asset.immigrateAsset.emigrateAssetTransaction.asset.emigrateAsset;
    const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
    // 累加资产
    tasks.next = eventEmitter.emit("asset", {
      type: "asset",
      transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        assetInfo,
        amount,
        sourceAmount: amount,
      },
    });

    return tasks.tryToPromise();
  }
}

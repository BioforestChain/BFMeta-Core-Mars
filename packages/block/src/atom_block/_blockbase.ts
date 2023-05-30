import type { Block } from "@bfchain/core-model-block";
import { TransactionInBlock } from "@bfchain/core-model-transaction";
import type {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  AsymmetricHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { isFlagInDev, ModuleStroge } from "@bfchain/util";
import type { CommonBlockVerify } from "./commonBlockVerify";
import type { VerifyBlockCore } from "./verifyBlock";
import type { ReplayBlockCore } from "./replayBlock";
import type { GenerateBlockCore } from "./generateBlock";
const { ArgumentIllegalException, NoFoundException, ConsensusException, info } =
  CoreExceptionGenerator("CONTROLLER", "_blockbase");
const isDevGenerateBlock = isFlagInDev("generateBlock");

export abstract class BlockFactory<T extends Block> {
  abstract transactionCore: import("@bfchain/core-transaction").TransactionCore;
  abstract blockHelper: BlockHelper;
  abstract baseHelper: BaseHelper;
  abstract cryptoHelper: BFChainCore.CryptoHelperInterface;
  abstract config: ConfigHelper;
  abstract statisticsHelper: BlockBaseStatisticsHelper;
  abstract asymmetricHelper: AsymmetricHelper;
  abstract blockGeneratorCalculator: import("./blockGeneratorCalculator").BlockGeneratorCalculator;

  abstract commonBlockVerify: CommonBlockVerify<T>;
  abstract verifyBlockCore: VerifyBlockCore<T>;
  abstract generateBlockCore: GenerateBlockCore<T>;
  abstract replayBlockCore: ReplayBlockCore<T>;
  abstract moduleMap: ModuleStroge;

  abstract fromJSON(blockBody: BFChainCore.BlockJSON<BFChainCore.GetBlockAssetJSON<T>>): Promise<T>;

  /**生产区块 */
  abstract _generateBlock(body: BFChainCore.BlockBody, asset: BFChainCore.GetBlockAssetJSON<T>): T;

  /** transactionInBlockFromJSON*/
  transactionInBlockFromJSON<T extends BFChainCore.TransactionJSON>(
    twi: BFChainCore.TransactionInBlockJSON<T>,
  ) {
    const transactionInBlock = TransactionInBlock.fromObject(twi) as TransactionInBlock<
      BFChainCore.Transaction<BFChainCore.GetTransactionJSONAssetJSON<T>>
    >;
    return transactionInBlock;
  }

  /**
   * 锻造区块
   *
   * @param body
   * @param asset
   * @param transactions
   * @param keypair
   * @param secondKeypair
   * @param eventEmitter
   * @param config
   */
  async generateBlock(
    body: BFChainCore.BlockBody,
    asset: BFChainCore.GetBlockAssetJSON<T>,
    transactions: AsyncIterable<TransactionInBlock>,
    keypair: {
      publicKey: Buffer;
      secretKey: Buffer;
    },
    secondKeypair?: {
      publicKey: Buffer;
      secretKey: Buffer;
    },
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
    config = this.config,
  ) {
    isDevGenerateBlock && info("begin generateBlock");
    await this.generateBlockCore.generateBlockBefore(body, asset, transactions, eventEmitter);

    const block = this._generateBlock(body, asset);

    await this.generateBlockCore.generateBlockAfter(
      block,
      transactions,
      keypair,
      secondKeypair,
      eventEmitter,
      config,
    );

    isDevGenerateBlock && info("finish generateBlock");
    return block;
  }

  /**
   * 重放区块
   *
   * @param block
   * @param transactions
   * @param eventEmitter
   * @param options
   * @param config
   */
  async replayBlock(
    block: T,
    transactions: AsyncIterable<TransactionInBlock>,
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
    options: BFChainCore.ReplayBlockOptions = {},
    config = this.config,
  ) {
    return await this.replayBlockCore.replayBlock(
      block,
      transactions,
      eventEmitter,
      options,
      config,
    );
  }

  /**
   * 块内资产变动 hash
   *
   * @param height
   * @param hash
   * @param options
   */
  async checkAssetChangeHash(
    height: number,
    hash: string,
    options: BFChainCore.ReplayBlockOptions = {},
  ) {
    let accountGetterHelper = options.accountGetterHelper;
    if (!accountGetterHelper) {
      accountGetterHelper = this.moduleMap.get("accountGetterHelper");
      if (!accountGetterHelper) {
        throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
          prop: "accountGetterHelper",
          target: "moduleStroge",
        });
      }
    }
    const assetChanges = await accountGetterHelper.getAccountsAssetsChange(height);
    const calcHash = await this.blockHelper.calcAssetChangeHash(assetChanges);
    if (calcHash !== hash) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `assetChangeHash ${hash}`,
        be_compare_prop: `assetChangeHash ${calcHash}`,
        to_target: "block",
        be_target: "calculate",
      });
    }
  }

  /**
   * 验证主密码的密钥对是否合法
   *
   * @param keypair
   */
  verifyKeypair(keypair: BFChainCore.Keypair) {
    if (!keypair) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "keypair",
      });
    }

    const Keypair_Exception_Detail = {
      target: "keypair",
    } as const;
    const { baseHelper } = this;

    const { publicKey, secretKey } = keypair;
    if (!publicKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...Keypair_Exception_Detail,
      });
    }
    if (!baseHelper.isValidPublicKey(publicKey)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `publicKey ${publicKey}`,
        ...Keypair_Exception_Detail,
      });
    }

    if (!secretKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        param: "secretKey",
        ...Keypair_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSecretKey(secretKey)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `secretKey ${secretKey}`,
        ...Keypair_Exception_Detail,
      });
    }
  }

  /**
   * 校验区块基础信息
   *
   * @param body
   * @param remark
   */
  async verifyBlockBody(
    body: BFChainCore.BlockBody,
    blockAsset: BFChainCore.GetBlockAssetJSON<T>,
    config = this.config,
  ) {
    this.commonBlockVerify.verifyBlockBody(body, blockAsset);
  }

  /**
   * 完整校验区块
   *
   * @param block
   */
  async verify(block: T, config = this.config) {
    await this.verifyBlockCore.verify(block, config);
  }

  /**生成区块的 signature */
  async generateSignature(block: Block) {
    return await this.blockHelper.generateSignature(block);
  }

  /**
   * 指定的区块是否已经存在
   *
   * @param signature
   * @param height
   * @param blockGetterHelper
   */
  async isBlockAlreadyExist(
    signature: string,
    height: number,
    blockGetterHelper: Pick<BFChainCore.BlockGetterHelperInterface, "getCountBlock">,
  ) {
    await this.commonBlockVerify.isBlockAlreadyExist(signature, height, blockGetterHelper);
  }
}

import type { Block, GetBlockRemarkJSON } from "@bfchain/core-model-block";
import { TransactionInBlock } from "@bfchain/core-model-transaction";
import type {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  AsymmetricHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
} from "@bfchain/core-util-exception";
import { isFlagInDev } from "@bfchain/util";
import type { CommonBlockVerify } from "./commonBlockVerify";
import type { VerifyBlockCore } from "./verifyBlock";
import type { ReplayBlockCore } from "./replayBlock";
import type { GenerateBlockCore } from "./generateBlock";
const { ArgumentIllegalException, info } = CoreExceptionGenerator("CONTROLLER", "_blockbase");
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

  abstract fromJSON(blockBody: BFChainCore.BlockJSON<GetBlockRemarkJSON<T>>): Promise<T>;

  /**生产区块 */
  abstract _generateBlock(body: BFChainCore.BlockBody, remark: GetBlockRemarkJSON<T>): T;

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
   * @param remark
   * @param transactions
   * @param keypair
   * @param eventEmitter
   * @param config
   */
  async generateBlock(
    body: BFChainCore.BlockBody,
    remark: GetBlockRemarkJSON<T>,
    transactions: AsyncIterable<TransactionInBlock>,
    keypair: {
      publicKey: Buffer;
      secretKey?: Buffer;
    },
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
    config = this.config,
  ) {
    isDevGenerateBlock && info("begin generateBlock");
    await this.generateBlockCore.generateBlockBefore(body, remark, transactions, eventEmitter);

    const block = this._generateBlock(body, remark);

    await this.generateBlockCore.generateBlockAfter(
      block,
      transactions,
      keypair,
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
   * @param remark
   * @param transactions
   * @param publicKey
   * @param eventEmitter
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
   * 验证主密码的密钥对是否合法
   *
   * @param keypair
   */
  verifyKeypair(keypair: BFChainCore.Keypair) {
    const Function_Exception_Detail = {
      function: "verifyKeypair",
    };

    if (!keypair) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "keypair",
        ...Function_Exception_Detail,
      });
    }

    const Keypair_Exception_Detail = {
      target: "keypair",
    } as const;
    const { baseHelper } = this;

    if (!keypair.publicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...Keypair_Exception_Detail,
      });
    }
    if (!baseHelper.isValidPublicKey(keypair.publicKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "publicKey",
        ...Keypair_Exception_Detail,
      });
    }

    if (!keypair.secretKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        param: "secretKey",
        ...Keypair_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSecretKey(keypair.secretKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "secretKey",
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
    remark: GetBlockRemarkJSON<T>,
    config = this.config,
  ) {
    this.commonBlockVerify.verifyBlockBody(body, remark);
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

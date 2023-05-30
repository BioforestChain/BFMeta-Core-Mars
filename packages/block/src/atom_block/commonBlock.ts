import type { TransactionInBlock } from "@bfchain/core-model-transaction";
import { BlockFactory } from "./_blockbase";
import { CommonBlock } from "@bfchain/core-model-block";
import {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  MilestonesHelper,
  AsymmetricHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import { Injectable, Inject, ModuleStroge } from "@bfchain/util";
import { BlockGeneratorCalculator } from "./blockGeneratorCalculator";
import { CommonBlockVerify } from "./commonBlockVerify";
import { VerifyBlockCore } from "./verifyBlock";
import { GenerateBlockCore } from "./generateBlock";
import { ReplayBlockCore } from "./replayBlock";

/**
 * commonBlock 工厂
 *
 */
@Injectable()
export class CommonBlockFactory extends BlockFactory<CommonBlock> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;
  constructor(
    public blockHelper: BlockHelper,
    public baseHelper: BaseHelper,
    public config: ConfigHelper,
    public statisticsHelper: BlockBaseStatisticsHelper,
    public milestonesHelper: MilestonesHelper,
    public asymmetricHelper: AsymmetricHelper,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    public blockGeneratorCalculator: BlockGeneratorCalculator,

    public commonBlockVerify: CommonBlockVerify<CommonBlock>,
    public verifyBlockCore: VerifyBlockCore<CommonBlock>,
    public generateBlockCore: GenerateBlockCore<CommonBlock>,
    public replayBlockCore: ReplayBlockCore<CommonBlock>,

    public moduleMap: ModuleStroge,
  ) {
    super();
  }

  /**
   * 从 json 转出 protobuf
   * JSON格式一般是进程内部通讯在使用,所以JSON格式默认不校验
   *
   * @param blockBody
   */
  async fromJSON(
    blockBody: BFChainCore.BlockJSON<BFChainCore.CommonBlockAssetJSON>,
    opts?: { verify?: boolean; config?: ConfigHelper },
  ) {
    const block = CommonBlock.fromObject(blockBody);
    // if (blockBody.transactions && blockBody.transactions.length > 0) {
    //   block.transactions = blockBody.transactions.map((twi) => {
    //     return this.transactionInBlockFromJSON(twi);
    //   });
    // } else {
    //   block.transactions = [];
    // }

    if (opts && opts.verify) {
      await this.verify(block, opts.config);
    }
    return block;
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param commonBlockAsset
   */
  async verifyBlockBody(
    body: BFChainCore.BlockBody,
    commonBlockAsset: BFChainCore.CommonBlockAssetJSON,
    config = this.config,
  ) {
    await super.verifyBlockBody(body, commonBlockAsset, config);
  }

  /**
   * 初始化 commonBlock
   *
   * @param body
   * @param commonBlockAset
   */
  _generateBlock(body: BFChainCore.BlockBody, commonBlockAset: BFChainCore.CommonBlockAssetJSON) {
    const block = CommonBlock.fromObject({ ...body, asset: commonBlockAset });
    // 绑定区块奖励
    block.reward = this.milestonesHelper.calcReward(block.height);

    return block;
  }

  async replayBlock(
    block: BFChainCore.CommonBlock,
    transactions: AsyncIterable<TransactionInBlock>,
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
    options: BFChainCore.ReplayBlockOptions = {},
    config = this.config,
  ) {
    await super.replayBlock(block, transactions, eventEmitter, options, config);

    if (options.verifyAsset) {
      await this.checkAssetChangeHash(
        block.height,
        block.asset.commonAsset.assetChangeHash,
        options,
      );
    }

    return block;
  }
}

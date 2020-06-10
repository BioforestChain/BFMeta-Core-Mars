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
import { CoreExceptionGenerator, PROP_IS_INVALID } from "@bfchain/core-util-exception";
import { Injectable, Inject } from "@bfchain/util";
import { BlockGeneratorCalculator } from "./blockGeneratorCalculator";
import { CommonBlockVerify } from "./commonBlockVerify";
import { VerifyBlockCore } from "./verifyBlock";
import { ReplayBlockCore } from "./replayBlock";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "CommonBlockFactory");

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
    public replayBlockCore: ReplayBlockCore<CommonBlock>,
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
    blockBody: BFChainCore.BlockJSON<BFChainCore.CommonBlockRemarkJSON>,
    opts?: { verify?: boolean; config?: ConfigHelper },
  ) {
    const block = CommonBlock.fromObject(blockBody);
    if (blockBody.transactions && blockBody.transactions.length > 0) {
      block.transactions = blockBody.transactions.map((twi) => {
        return this.transactionInBlockFromJSON(twi);
      });
    } else {
      block.transactions = [];
    }

    if (opts && opts.verify) {
      await this.verify(block, opts.config);
    }
    return block;
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param commonBlockRemark
   */
  async verifyBlockBody(
    body: BFChainCore.BlockBody,
    commonBlockRemark: BFChainCore.CommonBlockRemarkJSON,
    config = this.config,
  ) {
    await super.verifyBlockBody(body, commonBlockRemark, config);

    const Function_Exception_Detail = { function: "verifyBlockBody" };
    const CommonBlockRemark_Exception_Detail = {
      target: "CommonBlock.remark",
      ...Function_Exception_Detail,
    };

    const { baseHelper } = this;

    if (!baseHelper.isString(commonBlockRemark.debug)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "debug",
        type: "string",
        ...CommonBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isString(commonBlockRemark.info)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "info",
        type: "string",
        ...CommonBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidBlockParticipation(commonBlockRemark.blockParticipation)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "blockParticipation",
        type: "block participation",
        ...CommonBlockRemark_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 commonBlock
   *
   * @param body
   * @param commonBlockRemark
   */
  _generateBlock(
    body: BFChainCore.BlockBody,
    commonBlockRemark: BFChainCore.CommonBlockRemarkJSON,
  ) {
    const block = CommonBlock.fromObject({ ...body, remark: commonBlockRemark, statisticInfo: {} });
    // 绑定区块奖励
    block.reward = this.milestonesHelper.calcReward(block.height);

    return block;
  }
}

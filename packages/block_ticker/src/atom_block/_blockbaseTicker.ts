import {
  BlockHelper,
  ChainTimeHelper,
  ConfigHelper,
  AccountBaseHelper,
  JSBIHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, Inject } from "@bfchain/util";
import { BlockGeneratorCalculator } from "@bfchain/core-block";
import type { Block } from "@bfchain/core-model-block";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "TICKER",
  "BlockLogicTicker",
);

@Injectable()
export abstract class BlockTicker<T extends Block<any> = Block<any>> {
  @Inject(BlockHelper)
  protected blockHelper!: BlockHelper;
  @Inject(ConfigHelper)
  protected configHelper!: ConfigHelper;
  @Inject(ChainTimeHelper)
  protected timeHelper!: ChainTimeHelper;
  @Inject(AccountBaseHelper)
  protected accountBaseHelper!: AccountBaseHelper;
  @Inject(JSBIHelper)
  protected jsbiHelper!: JSBIHelper;
  @Inject(BlockGeneratorCalculator)
  protected blockGeneratorCalculator!: BlockGeneratorCalculator;
  @Inject("accountGetterHelper", { optional: true, dynamics: true })
  protected accountGetterHelper?: BFChainCore.AccountGetterHelperInterface;
  @Inject("blockGetterHelper", { optional: true, dynamics: true })
  protected blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
  @Inject("blockTickGetterHelper", { optional: true, dynamics: true })
  protected blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface;

  abstract tick(
    block: T,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface,
  ): Promise<void>;

  /**
   * 普通区块
   * 1. 累加打块账户打块数
   * 2. 分配锻造区块的收益
   *
   * 轮末块
   * 1. 做普通块做的事情
   * 2. 分配持仓账户的收益
   */
  async tickBlockBase(
    block: T,
    accountGetterHelper = this.accountGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    const blockUpdateData = await this.__calcForginAndHoldingRewards(block, accountGetterHelper);

    // 更新打块账户和投票账户（分配奖励）
    await this.__updateForgingAndHoldingAccount(block, blockUpdateData, blockTickGetterHelper);
  }

  /**
   * 获取持股账户
   *
   * @param accountGetterHelper
   * @returns
   */
  private async __getShareEntityHolders(accountGetterHelper = this.accountGetterHelper) {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    const holders = await accountGetterHelper.getShareEntityHolders();
    let totalEntities = 0;
    for (const holder of holders) {
      totalEntities += holder.numberOfGeneratorEntities;
    }
    // 不需要进行排序，得到的奖励只和账户持仓数量有关，分配剩余的奖励不处理
    return {
      holders,
      totalEntities,
    };
  }

  /**
   * 计算打块奖励和持股分红
   *
   * @param block
   * @param accountGetterHelper
   */
  private async __calcForginAndHoldingRewards(
    block: T,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    const { blockHelper } = this;
    let totalEntities = 0;
    let holders: BFChainCore.EntityHolderInfo[] = [];
    // 轮末块并且还有未流通的主权益
    if (blockHelper.isRoundLastBlock(block.height) && block.reward !== "0") {
      const result = await this.__getShareEntityHolders(accountGetterHelper);
      totalEntities = result.totalEntities;
      holders = result.holders;
    }
    const blockUpdateData = this.blockHelper.calcForginAndHoldingRewards(
      block,
      totalEntities,
      holders,
    );
    return blockUpdateData;
  }

  /**
   * 更新打块账户和持仓账户
   *
   * @param block
   * @param blockUpdateData
   * @param accountGetterHelper
   * @param blockTickGetterHelper
   */
  private async __updateForgingAndHoldingAccount(
    block: T,
    blockUpdateData: BFChainCore.BlockUpdateDataInfo,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    if (!blockTickGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockTickGetterHelper",
        target: "moduleStroge",
      });
    }
    const { forgingRewards, holdingRewardsList, circulations } = blockUpdateData;
    if (holdingRewardsList.length > 0) {
      await blockTickGetterHelper.updateHoldingAccount(block, holdingRewardsList);
    }
    await blockTickGetterHelper.updateForgingAccount(block, forgingRewards);
    if (circulations > BigInt(0)) {
      await blockTickGetterHelper.accumulateCirculations(
        this.configHelper.magic,
        this.configHelper.assetType,
        circulations,
      );
    }
  }
}

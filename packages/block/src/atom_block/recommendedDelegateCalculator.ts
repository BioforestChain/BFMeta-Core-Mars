import { Injectable, Inject } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { ConfigHelper, AccountBaseHelper, JSBIHelper, BlockHelper } from "@bfchain/core-helper";
const { NoFoundException } = CoreExceptionGenerator("BLOCK", "RecommendedDelegateCalculator");

/**
 * 自动投票推荐列表计算器
 */
@Injectable()
export class RecommendedDelegateCalculator<T extends BFChainCore.ForSortAccountInfo> {
  constructor(
    private config: ConfigHelper,
    private blockHelper: BlockHelper,
    private accountBaseHelper: AccountBaseHelper,
    private jsbiHelper: JSBIHelper,
  ) {}

  // 最近 10 轮的打块情况
  private forgingDelegates = {
    delegates: [] as string[],
    curRound: 0,
  };

  /**
   * 计算账户得打块数量和打包的交易数量
   *
   * @param currentBlockHeight
   * @param numberOfRounds
   * @param blockGetterHelper
   * @param aborter
   */
  private async calDelegateNumberOfForgingAndPackagedTransactions(
    currentBlockHeight: number,
    numberOfRounds: number,
    blockGetterHelper: BFChainCore.BlockGetterHelperInterface,
    aborter?: BFChainUtil.Aborter,
  ) {
    const blockPerRound = this.config.blockPerRound;
    // 获取起始计算高度
    const maxHeight =
      currentBlockHeight <= blockPerRound
        ? currentBlockHeight
        : currentBlockHeight - (currentBlockHeight % blockPerRound);

    let minHeight = 1;
    {
      const numberOfBlocks = numberOfRounds * blockPerRound;
      if (maxHeight > numberOfBlocks) {
        minHeight = maxHeight - numberOfBlocks;
      }
      // 创世账户不纳入推荐列表
    }

    const blocks = aborter
      ? await aborter.wrapAsync(
          this.blockHelper.getBlocksByRange(minHeight, maxHeight, blockGetterHelper),
        )
      : await this.blockHelper.getBlocksByRange(minHeight, maxHeight, blockGetterHelper);
    const generatorAddressList: string[] = [];
    const forgeInfoMap = new Map<string, BFChainCore.ForgeInfos>();
    for (const block of blocks) {
      const address = await this.accountBaseHelper.getAddressFromPublicKeyString(
        block.generatorPublicKey,
      );
      const forgeInfo = forgeInfoMap.get(address);
      if (forgeInfo) {
        forgeInfo.producedblocks++;
        forgeInfo.applyTxNumber += block.numberOfTransactions;
      } else {
        generatorAddressList[generatorAddressList.length] = address;
        forgeInfoMap.set(address, {
          producedblocks: 1,
          applyTxNumber: block.numberOfTransactions,
        });
      }
    }

    return { forgeInfoMap, generatorAddressList };
  }

  /**
   * 计算可被选取的受托人
   *
   * @param minBeSelectProductivity
   * @param generatorAddressList
   * @param forgeInfoMap
   * @param accountGetterHelper
   * @param aborter
   */
  private async calCanBePickAccounts(
    minBeSelectProductivity: BFChainCore.FractionJSON,
    generatorAddressList: string[],
    forgeInfoMap: Map<string, BFChainCore.ForgeInfos>,
    curRound: number,
    accountGetterHelper: Pick<BFChainCore.AccountGetterHelperInterface, "getAccounts">,
    aborter?: BFChainUtil.Aborter,
  ) {
    const accounts = aborter
      ? await aborter.wrapAsync(accountGetterHelper.getAccounts(generatorAddressList, curRound))
      : await accountGetterHelper.getAccounts(generatorAddressList, curRound);

    const canBePickAccounts: BFChainCore.CanBePickAccount[] = [];

    const jsbiHelper = this.jsbiHelper;
    // 过滤掉在线率不符合，已经关闭投票的账户
    for (const account of accounts) {
      if (
        jsbiHelper.compareFraction(
          jsbiHelper.numberToFraction(account.productivity),
          minBeSelectProductivity,
        ) >= 0 &&
        account.isAcceptVote
      ) {
        const forgeInfo = forgeInfoMap.get(account.address) as BFChainCore.ForgeInfos;
        const info: BFChainCore.CanBePickAccount = {
          address: account.address,
          productivity: account.productivity,
          forgedBlocks: forgeInfo.producedblocks,
          applyTxNumber: forgeInfo.applyTxNumber,
          vote: account.vote,
        };
        canBePickAccounts[canBePickAccounts.length] = info;
      } else {
        forgeInfoMap.delete(account.address);
      }
    }

    return canBePickAccounts;
  }

  /**
   * 给打造区块的代理人进行排序(按在线率、打块数量、上一轮得票率之一从大到小排序)
   *
   * @param {*} array
   * @param {*} fields
   * @param {*} needBignumber
   */
  private sortDelegatesByFields(
    array: BFChainCore.CanBePickAccount[],
    fields: string,
  ): BFChainCore.CanBePickAccount[] {
    if (array.length <= 1) {
      return array;
    }
    const temp_array = [...array];
    const midIndex = Math.floor(temp_array.length / 2);
    const pivot = temp_array.splice(midIndex, 1)[0];
    const left: BFChainCore.CanBePickAccount[] = [];
    const right: BFChainCore.CanBePickAccount[] = [];

    for (let i = 0; i < temp_array.length; i++) {
      const item = temp_array[i];
      if ((item as any)[fields] > (pivot as any)[fields]) {
        left[left.length] = temp_array[i];
        continue;
      }
      if ((item as any)[fields] < (pivot as any)[fields]) {
        right[right.length] = temp_array[i];
        continue;
      }
      if (item.address < pivot.address) {
        left[left.length] = temp_array[i];
        continue;
      }
      right[right.length] = temp_array[i];
    }
    return this.sortDelegatesByFields(left, fields).concat(
      [pivot],
      this.sortDelegatesByFields(right, fields),
    );
  }

  /**
   * 数组混合
   *
   * @param {*} pdtArray
   * @param {*} fbsArray
   * @param {*} atnArray
   * @param {*} votArray
   * @param {*} newArray
   */
  private hybridArray(
    pdtArray: string[],
    fbsArray: string[],
    atnArray: string[],
    votArray: string[],
    newArray: string[],
  ) {
    const results: string[] = [...pdtArray, ...fbsArray, ...atnArray, ...votArray, ...newArray];
    let i = results.length;
    while (i) {
      const j = Math.floor(Math.random() * i--);
      [results[j], results[i]] = [results[i], results[j]];
    }
    return results;
  }

  /**
   * 计算推荐的投票账户候选名单
   *
   * @param currentBlockHeight
   * @param recommendedDelegateOptions
   * @param activeDelegates
   * @param accountGetterHelper
   * @param blockGetterHelper
   * @param aborter
   */
  private async calRecommendedDelegates(
    currentBlockHeight: number,
    recommendedDelegateOptions: BFChainCore.RecommendedDelegateOptions,
    activeDelegates: string[],
    accountGetterHelper: Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccounts" | "getRecommendedNewDelegates"
    >,
    blockGetterHelper: BFChainCore.BlockGetterHelperInterface,
    aborter?: BFChainUtil.Aborter,
  ) {
    const { forgeInfoMap, generatorAddressList } =
      await this.calDelegateNumberOfForgingAndPackagedTransactions(
        currentBlockHeight,
        recommendedDelegateOptions.numberOfRounds,
        blockGetterHelper,
        aborter,
      );

    const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);
    const canBePickAccounts = await this.calCanBePickAccounts(
      recommendedDelegateOptions.minBeSelectProductivity,
      generatorAddressList,
      forgeInfoMap,
      curRound,
      accountGetterHelper,
      aborter,
    );

    // 按照不同条件进行排序
    const jsbiHelper = this.jsbiHelper;
    const totalQuota = canBePickAccounts.length;
    const pdtNum = Number(
      jsbiHelper.multiplyFloorFraction(totalQuota, recommendedDelegateOptions.productivityPercent),
    );
    const fbsNum = Number(
      jsbiHelper.multiplyFloorFraction(totalQuota, recommendedDelegateOptions.forgedBlocksPercent),
    );
    const atnNum = Number(
      jsbiHelper.multiplyFloorFraction(totalQuota, recommendedDelegateOptions.applyTxPercent),
    );
    const votNum = Number(
      jsbiHelper.multiplyFloorFraction(totalQuota, recommendedDelegateOptions.votePercent),
    );
    const newNum = totalQuota - pdtNum - fbsNum - atnNum - votNum;
    // 获取在线率前 n 个账户
    const sortByProductivity = this.sortDelegatesByFields(canBePickAccounts, "productivity");
    const pdtArray = sortByProductivity.splice(0, pdtNum).map((account) => account.address);
    // 获取打块数量前 n 个账户
    const sortByForgedBlocks = this.sortDelegatesByFields(sortByProductivity, "forgedBlocks");
    const fbsArray = sortByForgedBlocks.splice(0, fbsNum).map((account) => account.address);
    // 获取处理交易数量前 n 个账户
    const sortByApplyTxNumber = this.sortDelegatesByFields(sortByForgedBlocks, "applyTxNumber");
    const atnArray = sortByApplyTxNumber.splice(0, atnNum).map((account) => account.address);
    // 获取得票率前 n 的账户
    const voteArray: BFChainCore.CanBePickAccount[] = [];
    for (const canBePickAccount of sortByApplyTxNumber) {
      // 去除的票率前 m 的账户
      if (!activeDelegates.includes(canBePickAccount.address)) {
        voteArray[voteArray.length] = canBePickAccount;
      }
    }
    const sortByVote = this.sortDelegatesByFields(voteArray, "vote");
    const votArray = sortByVote.splice(0, votNum).map((account) => account.address);
    // 获取 n 个 新受托人账户
    const newDelegates = aborter
      ? await aborter.wrapAsync(
          accountGetterHelper.getRecommendedNewDelegates(
            newNum,
            currentBlockHeight,
            recommendedDelegateOptions.newDelegateAssetNeedInfo,
          ),
        )
      : await accountGetterHelper.getRecommendedNewDelegates(
          newNum,
          currentBlockHeight,
          recommendedDelegateOptions.newDelegateAssetNeedInfo,
        );
    const newArray: string[] = [];
    for (const delegate of newDelegates) {
      if (delegate.isAcceptVote) {
        newArray[newArray.length] = delegate.address;
      }
    }
    // 新人太少，从打块列表中补足
    if (newArray.length < newNum) {
      const alternateArray = this.sortDelegatesByFields(voteArray, "productivity");
      for (const item of alternateArray) {
        newArray[newArray.length] = item.address;
        if (newArray.length === newNum) {
          break;
        }
      }
    }
    // 乱序
    this.forgingDelegates.delegates = this.hybridArray(
      pdtArray,
      fbsArray,
      atnArray,
      votArray,
      newArray,
    );
  }

  /**
   * 根据条件过滤并且获取未被投票的代理人
   *
   * @param {*} sourceArray
   * @param {*} filterSet
   * @param {*} resultArray
   * @param {*} maxNumberOfRecommended
   */
  private allocationQuota(
    sourceArray: string[],
    filterSet: Set<string>,
    resultArray: string[],
    maxNumberOfRecommended: number,
  ) {
    if (sourceArray.length === 0) {
      return;
    }
    for (let i = 0; i < sourceArray.length; i++) {
      if (!filterSet.has(sourceArray[i])) {
        if (resultArray.indexOf(sourceArray[i]) < 0) {
          resultArray[resultArray.length] = sourceArray[i];
        }
      }
      if (resultArray.length === maxNumberOfRecommended) {
        break;
      }
    }
  }

  /**
   * 推荐的受托人列表
   *
   * @param address 需要获取推荐列表的账户地址
   * @param currentBlockHeight 当前区块高度
   * @param recommendedDelegateOptions 生成推荐列表的参数
   * @param accountGetterHelper 账户相关辅助类
   * @param blockGetterHelper 区块相关辅助类
   * @param options 辅助插件
   */
  async randomAccessDelegates(
    address: string,
    currentBlockHeight: number,
    recommendedDelegateOptions: BFChainCore.RecommendedDelegateOptions,
    accountGetterHelper: Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountVoteInfo" | "getMemoryDelegates" | "getAccounts" | "getRecommendedNewDelegates"
    >,
    blockGetterHelper: BFChainCore.BlockGetterHelperInterface,
    options?: {
      aborter?: BFChainUtil.Aborter;
      memoryDelegates?: string[];
      delegates?: BFChainCore.ForSortAccountInfo[];
    },
  ) {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }

    const aborter = options && options.aborter;
    /**最终选出的受托人 */
    const pickDelegates: string[] = [];
    /**本次推选的受托人数量 */
    const maxNumberOfRecommended = recommendedDelegateOptions.maxNumberOfRecommended;
    const blockPerRound = this.config.blockPerRound;

    // 获取账户的已投账户
    const votedResult = aborter
      ? await aborter.wrapAsync(accountGetterHelper.getAccountVoteInfo(currentBlockHeight, address))
      : await accountGetterHelper.getAccountVoteInfo(currentBlockHeight, address);
    const noLongerVoteSet = new Set<string>(votedResult);
    // 获取当前轮的打块账户
    const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);
    let blockHeight = (curRound - 1) * blockPerRound;
    // 第一轮拿的是创世块选出的受托人
    blockHeight = blockHeight || 1;
    const block = aborter
      ? await aborter.wrapAsync(
          this.blockHelper.forceGetBlockByHeight(blockHeight, blockGetterHelper),
        )
      : await this.blockHelper.forceGetBlockByHeight(blockHeight, blockGetterHelper);
    let nextRoundDelegates: BFChainCore.NextRoundDelegateJSON[] = [];
    if (blockHeight === 1) {
      nextRoundDelegates = (block as BFChainCore.Block<BFChainCore.GenesisBlockAssetJSON>).asset
        .genesisAsset.nextRoundDelegates;
    } else {
      nextRoundDelegates = (block as BFChainCore.Block<BFChainCore.RoundLastBlockAssetJSON>).asset
        .roundLastAsset.nextRoundDelegates;
    }
    const activeDelegates = nextRoundDelegates.map((delegate) => delegate.address);
    // 不推荐本轮打块账户,剔除第一轮
    if (blockHeight > blockPerRound) {
      for (const address of activeDelegates) {
        noLongerVoteSet.add(address);
      }
    }
    let memoryDelegates: string[];
    let delegates: BFChainCore.ForSortAccountInfo[];
    // 获取矿机注入的受托人
    if (options && options.memoryDelegates) {
      memoryDelegates = options.memoryDelegates;
    } else {
      memoryDelegates = aborter
        ? await aborter.wrapAsync(accountGetterHelper.getMemoryDelegates())
        : await accountGetterHelper.getMemoryDelegates();
    }
    // 去除关闭接收投票的账户
    if (options && options.delegates) {
      delegates = options.delegates;
    } else {
      delegates = aborter
        ? await aborter.wrapAsync(accountGetterHelper.getAccounts(memoryDelegates, curRound))
        : await accountGetterHelper.getAccounts(memoryDelegates, curRound);
    }
    for (const delegate of delegates) {
      if (!delegate.isAcceptVote) {
        noLongerVoteSet.add(delegate.address);
      }
    }
    for (const address of memoryDelegates) {
      if (!noLongerVoteSet.has(address)) {
        pickDelegates[pickDelegates.length] = address;
      }
      // 已经选出足够多的人了
      if (pickDelegates.length === maxNumberOfRecommended) {
        return {
          delegate: pickDelegates,
        };
      }
    }
    // 从候选名单中获取推荐的人
    const isNewRound = curRound !== this.forgingDelegates.curRound;
    // 跨轮次时刷新候选人名单
    if (isNewRound || currentBlockHeight <= blockPerRound) {
      this.forgingDelegates.delegates = [];
      this.forgingDelegates.curRound = curRound;
      await this.calRecommendedDelegates(
        currentBlockHeight,
        recommendedDelegateOptions,
        activeDelegates,
        accountGetterHelper,
        blockGetterHelper,
        aborter,
      );
    }

    // 获取排名中取前 n 个
    this.allocationQuota(
      this.forgingDelegates.delegates,
      noLongerVoteSet,
      pickDelegates,
      maxNumberOfRecommended,
    );
    return {
      delegate: pickDelegates,
    };
  }
}

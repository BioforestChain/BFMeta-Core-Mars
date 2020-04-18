import { Injectable, Inject } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST } from "@bfchain/core-util-exception";
import { ConfigHelper, AccountBaseHelper, JSBIHelper, BlockHelper } from "@bfchain/core-helper";
const { NoFoundException } = CoreExceptionGenerator("BLOCK", "RecommendedDelegateCalculator");

/**
 * 区块锻造者计算器
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
   */
  private async calDelegateNumberOfForgingAndPackagedTransactions(
    currentBlockHeight: number,
    numberOfRounds: number,
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface,
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

    const blocks = await this.blockHelper.getBlocksByRange(minHeight, maxHeight, blockGetterHelper);
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
   */
  private async calCanBePickAccounts(
    minBeSelectProductivity: BFChainCore.FractionJSON,
    generatorAddressList: string[],
    forgeInfoMap: Map<string, BFChainCore.ForgeInfos>,
    accountGetterHelper?: Pick<BFChainCore.AccountGetterHelperInterface, "getAccounts">,
  ) {
    const Function_Exception_Detail = {
      function: "calCanBePickAccounts",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const accounts = await accountGetterHelper.getAccounts(generatorAddressList);

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
      if ((temp_array as any)[i][fields] > (pivot as any)[fields]) {
        left[left.length] = temp_array[i];
      } else {
        right[right.length] = temp_array[i];
      }
    }
    return this.sortDelegatesByFields(left, fields).concat(
      [pivot],
      this.sortDelegatesByFields(right, fields),
    );
  }

  /**
   * 数组混合: 3 + 3 + 3 + 1 模式
   *
   * @param {*} pdtArray
   * @param {*} fbsArray
   * @param {*} atnArray
   * @param {*} votArray
   */
  private hybridArray(
    pdtArray: string[],
    fbsArray: string[],
    atnArray: string[],
    votArray: string[],
  ) {
    const results: string[] = [];
    const temp_pdtArray = [...pdtArray];
    const temp_fbsArray = [...fbsArray];
    const temp_atnArray = [...atnArray];
    const temp_votArray = [...votArray];
    while (true) {
      if (temp_pdtArray.length > 0) {
        results.push.apply(results, temp_pdtArray.splice(0, 3));
      }
      if (temp_fbsArray.length > 0) {
        results.push.apply(results, temp_fbsArray.splice(0, 3));
      }
      if (temp_atnArray.length > 0) {
        results.push.apply(results, temp_atnArray.splice(0, 3));
      }
      if (temp_votArray.length > 0) {
        results.push.apply(results, temp_votArray.splice(0, 1));
      }
      const isFinish =
        temp_pdtArray.length === 0 &&
        temp_fbsArray.length === 0 &&
        temp_atnArray.length === 0 &&
        temp_votArray.length === 0;
      if (isFinish) {
        break;
      }
    }
    return results;
  }

  /**
   * 计算推荐的投票账户候选名单
   *
   * @param currentBlockHeight
   * @param options
   * @param activeDelegates
   * @param accountGetterHelper
   * @param blockGetterHelper
   */
  private async calRecommendedDelegates(
    currentBlockHeight: number,
    options: BFChainCore.RecommendedDelegateOptions,
    activeDelegates: string[],
    accountGetterHelper?: Pick<BFChainCore.AccountGetterHelperInterface, "getAccounts">,
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "calRecommendedDelegates",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const {
      forgeInfoMap,
      generatorAddressList,
    } = await this.calDelegateNumberOfForgingAndPackagedTransactions(
      currentBlockHeight,
      options.numberOfRounds,
      blockGetterHelper,
    );

    const canBePickAccounts = await this.calCanBePickAccounts(
      options.minBeSelectProductivity,
      generatorAddressList,
      forgeInfoMap,
      accountGetterHelper,
    );

    // 按照不同条件进行排序
    const jsbiHelper = this.jsbiHelper;
    const totalQuota = canBePickAccounts.length;
    const pdtNum = Number(
      jsbiHelper.multiplyFloorFraction(totalQuota, options.productivityPercent),
    );
    const fbsNum = Number(
      jsbiHelper.multiplyFloorFraction(totalQuota, options.forgedBlocksPercent),
    );
    const atnNum = Number(jsbiHelper.multiplyFloorFraction(totalQuota, options.applyTxPercent));
    const votNum = totalQuota - pdtNum - fbsNum - atnNum;
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
    // 乱序
    this.forgingDelegates.delegates = this.hybridArray(pdtArray, fbsArray, atnArray, votArray);
  }

  /**
   * 根据条件过滤并且获取未被投票的代理人
   *
   * @param {*} sourceArray
   * @param {*} filterSet
   * @param {*} resultArray
   * @param {*} numberOfRecommended
   */
  private allocationQuota(
    sourceArray: string[],
    filterSet: Set<string>,
    resultArray: string[],
    numberOfRecommended: number,
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
      if (resultArray.length === numberOfRecommended) {
        break;
      }
    }
  }

  /**
   * 推荐的受托人列表
   *
   * @param address
   * @param currentBlockHeight
   * @param options
   * @param accountGetterHelper
   * @param blockGetterHelper
   */
  async randomAccessDelegates(
    address: string,
    currentBlockHeight: number,
    options: BFChainCore.RecommendedDelegateOptions,
    accountGetterHelper?: Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountVoteInfo" | "getMemoryDelegates" | "getAccounts"
    >,
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "calRecommendedDelegate",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    /**最终选出的受托人 */
    const pickDelegates: string[] = [];
    /**本次推选的受托人数量 */
    const numberOfRecommended = options.numberOfRecommended;
    const blockPerRound = this.config.blockPerRound;

    // 获取账户的已投账户
    const votedResult = await accountGetterHelper.getAccountVoteInfo(currentBlockHeight, address);
    const noLongerVoteSet = new Set<string>(votedResult);
    // 获取当前轮的打块账户
    const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);
    let blockHeight = (curRound - 1) * blockPerRound;
    // 第一轮拿的是创世块选出的受托人
    blockHeight = blockHeight || 1;
    const block = await this.blockHelper.forceGetBlockByHeight(blockHeight, blockGetterHelper);
    const nextRoundDelegates = (block as BFChainCore.Block<BFChainCore.RoundLastBlockRemarkJSON>)
      .remark.nextRoundDelegates;
    const activeDelegates = nextRoundDelegates.map((delegate) => delegate.address);
    // 不推荐本轮打块账户
    for (const address of activeDelegates) {
      noLongerVoteSet.add(address);
    }
    // 获取矿机注入的受托人
    const memoryDelegates = await accountGetterHelper.getMemoryDelegates();
    // 去除关闭接收投票的账户
    const delegates = await accountGetterHelper.getAccounts(memoryDelegates);
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
      if (pickDelegates.length === numberOfRecommended) {
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
        options,
        activeDelegates,
        accountGetterHelper,
        blockGetterHelper,
      );
    }

    // 获取排名中取前 n 个
    this.allocationQuota(
      this.forgingDelegates.delegates,
      noLongerVoteSet,
      pickDelegates,
      numberOfRecommended,
    );
    return {
      delegate: pickDelegates,
    };
  }
}

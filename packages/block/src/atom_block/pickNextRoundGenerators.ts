import { BlockHelper, ConfigHelper, TransactionHelper } from "@bfchain/core-helper";
import { Injectable } from "@bfchain/util";
import { AccountHelper } from "@bfchain/core-helper-account";

/**
 * 区块锻造者计算器
 */
@Injectable()
export class PickNextRoundGenerators {
  constructor(
    private config: ConfigHelper,
    private blockHelper: BlockHelper,
    private accountHelper: AccountHelper,
    private transactionHelper: TransactionHelper,
  ) {}

  /**
   * 获取受托人列表
   * @param currentHeight 当前高度
   */
  async getNextRoundGenerators(
    currentHeight: number,
    accountGetterHelper?: Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getNextRoundGenerators" | "getAccounts"
    >,
  ) {
    const currentRound = this.blockHelper.calcRoundByHeight(currentHeight);
    return await this.calcForgingGenerators(currentRound, accountGetterHelper);
  }

  async calcForgingGenerators<
    T extends BFChainCore.ForSortAccountInfo = BFChainCore.ForSortAccountInfo,
  >(
    round: number,
    accountGetterHelper?: Pick<
      BFChainCore.AccountGetterHelperInterface<any, T>,
      "getNextRoundGenerators" | "getAccounts"
    >,
  ) {
    let results = await this.accountHelper.getNextRoundGenerators(accountGetterHelper);
    const reSorted = results.length < this.config.blockPerRound ? true : false;
    let pickAddressArr = results.map((result) => result.address);
    let tempRound = round - 1;
    while (results.length < this.config.blockPerRound) {
      if (tempRound === 0) break;
      const queryResult = await this.__getAlternateGenerators(
        tempRound,
        results,
        pickAddressArr,
        accountGetterHelper,
      );
      results = queryResult.results;
      pickAddressArr = queryResult.pickAddressArr;
      tempRound--;
    }
    // 如果有获取候选人则必须排序
    if (reSorted) {
      results = this.blockHelper.sortInRankAccountInfoList(results);
    }
    return results;
  }

  /**
   * 获取补充的受托人
   * @param round
   * @param results
   * @param pickAddressArr
   * @param accountGetterHelper
   */
  private async __getAlternateGenerators(
    round: number,
    results: BFChainCore.ForSortAccountInfo[],
    pickAddressArr: string[],
    accountGetterHelper?: Pick<BFChainCore.AccountGetterHelperInterface, "getAccounts">,
  ) {
    const generatorAddressArr: string[] =
      await this.blockHelper.forceGetBlockGeneratorAddressByRound(round);
    const newGeneratorAddressArr: string[] = [];
    for (const address of generatorAddressArr) {
      if (!pickAddressArr.includes(address)) {
        pickAddressArr[pickAddressArr.length] = address;
        newGeneratorAddressArr[newGeneratorAddressArr.length] = address;
      }
    }
    let generators = await this.accountHelper.getAccounts(
      newGeneratorAddressArr,
      round,
      accountGetterHelper,
    );
    generators = this.__sortByProducedblocks(generators);
    results.push.apply(results, generators.slice(0, this.config.blockPerRound - results.length));
    return {
      results,
      pickAddressArr,
    };
  }

  private __sortByProducedblocks(
    array: BFChainCore.ForSortAccountInfo[],
  ): BFChainCore.ForSortAccountInfo[] {
    if (array.length <= 1) {
      return array;
    }
    const temp_array = [...array];
    const midIndex = Math.floor(temp_array.length / 2);
    const pivot = temp_array.splice(midIndex, 1)[0];
    const left: any = [];
    const right: any = [];
    for (let i = 0; i < temp_array.length; i++) {
      if (temp_array[i].producedblocks > pivot.producedblocks) {
        left[left.length] = temp_array[i];
      } else {
        right[right.length] = temp_array[i];
      }
    }
    return this.__sortByProducedblocks(left).concat([pivot], this.__sortByProducedblocks(right));
  }
}

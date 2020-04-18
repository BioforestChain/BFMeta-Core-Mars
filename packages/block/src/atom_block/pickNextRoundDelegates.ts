import {
  BlockHelper,
  ConfigHelper,
  AccountBaseHelper,
  TransactionHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import { Injectable, Inject } from "@bfchain/util";
import { AccountHelper } from "@bfchain/core-helper-account";
const { NoFoundException } = CoreExceptionGenerator("Core", "PickNextRoundDelegates");

/**
 * 区块锻造者计算器
 */
@Injectable()
export class PickNextRoundDelegates<T extends BFChainCore.ForSortAccountInfo> {
  constructor(
    private config: ConfigHelper,
    private blockHelper: BlockHelper,
    private accountHelper: AccountHelper,
    private accountBaseHelper: AccountBaseHelper,
    private transactionHelper: TransactionHelper,
  ) {}

  /**
   * 获取受托人列表
   * @param currentHeight 当前高度
   */
  async getNextRoundDelegates(
    currentHeight: number,
    accountGetterHelper?: Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getNextRoundDelegates" | "getAccounts"
    >,
  ) {
    const currentRound = this.blockHelper.calcRoundByHeight(currentHeight);

    return await this.calcForgingDelegates(currentRound, accountGetterHelper);
  }

  async calcForgingDelegates(
    round: number,
    accountGetterHelper?: Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getNextRoundDelegates" | "getAccounts"
    >,
  ) {
    let results = await this.accountHelper.getNextRoundDelegates<T>(accountGetterHelper);
    const reSorted = results.length < this.config.blockPerRound ? true : false;
    let pickAddressArr = results.map((result: T) => result.address);
    let tempRound = round - 1;
    while (results.length < this.config.blockPerRound) {
      if (tempRound === 0) break;
      const queryResult = await this.__getAlternateDelegates(
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
  private async __getAlternateDelegates(
    round: number,
    results: T[],
    pickAddressArr: string[],
    accountGetterHelper?: Pick<BFChainCore.AccountGetterHelperInterface, "getAccounts">,
  ) {
    if (round === 1) {
      return await this.getGenesisDelegates(results, pickAddressArr, accountGetterHelper);
    }

    const generatorAddressArr: string[] = await this.blockHelper.forceGetBlockGeneratorAddressByRound(
      round,
    );
    const newGeneratorAddressArr: string[] = [];
    for (const address of generatorAddressArr) {
      if (!pickAddressArr.includes(address)) {
        pickAddressArr[pickAddressArr.length] = address;
        newGeneratorAddressArr[newGeneratorAddressArr.length] = address;
      }
    }
    let delegates = await this.accountHelper.getAccounts<T>(
      newGeneratorAddressArr,
      accountGetterHelper,
    );
    delegates = this.__sortByProductivity(delegates);
    results.push.apply(results, delegates.slice(0, this.config.blockPerRound - results.length));
    return {
      results,
      pickAddressArr,
    };
  }
  /**
   * 从创世受托人中补足缺失的账户
   * @param {*} results
   */
  async getGenesisDelegates(
    results: T[],
    pickAddressArr: string[],
    accountGetterHelper?: Pick<BFChainCore.AccountGetterHelperInterface, "getAccounts">,
  ) {
    // 创世账户不能再出块
    const genesisDelegates = this.transactionHelper.genesisDelegates(this.config);
    const addressArray: string[] = [];
    for (const address of genesisDelegates) {
      if (!pickAddressArr.includes(address)) {
        addressArray[addressArray.length] = address;
        pickAddressArr[pickAddressArr.length] = address;
      }
    }
    let delegates = await this.accountHelper.getAccounts<T>(addressArray, accountGetterHelper);
    delegates = this.__sortByProductivity(delegates);
    results.push.apply(results, delegates.slice(0, this.config.blockPerRound - results.length));
    return {
      results,
      pickAddressArr,
    };
  }

  private __sortByProductivity(array: T[]): T[] {
    if (array.length <= 1) {
      return array;
    }
    const temp_array = [...array];
    const midIndex = Math.floor(temp_array.length / 2);
    const pivot = temp_array.splice(midIndex, 1)[0];
    const left: any = [];
    const right: any = [];
    for (let i = 0; i < temp_array.length; i++) {
      // float 类型，直接比较
      if (temp_array[i].productivity > pivot.productivity) {
        left[left.length] = temp_array[i];
      } else {
        right[right.length] = temp_array[i];
      }
    }
    return this.__sortByProductivity(left).concat([pivot], this.__sortByProductivity(right));
  }
}

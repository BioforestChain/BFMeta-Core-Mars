declare namespace BFChainCore {
  type SomeBlockModel = import("./").SomeBlockModel<any>;

  type Block<RJ extends CommonBlockRemarkJSON = CommonBlockRemarkJSON> = import("./block").Block<
    RJ
  >;
  interface SomeBlockJSON<T extends BlockJSON> {
    block: T;
  }

  type BlockModelConstructor = typeof import("./").Block;

  type GetRemarkModel<T> = T extends BlockJSON<infer U> ? U : any;

  interface BlockWithoutTransactionJSON<RemarkJSON> {
    version: number;
    id: string;
    height: number;
    blockSize: number;
    timestamp: number;
    blockSignature: string;
    generatorPublicKey: string;
    numberOfTransactions: number;
    payloadHash: string;
    payloadLength: number;
    previousBlock: string;
    totalAmount: string;
    totalFee: string;
    reward: string;
    magic: string;
    remark: RemarkJSON;
    statisticInfo: StatisticInfoJSON;
  }
  interface BlockJSON<RemarkJSON extends {} = {}> extends BlockWithoutTransactionJSON<RemarkJSON> {
    transactions: TransactionInBlockJSON[];
  }

  //#region Statistic Info

  interface CountAndAmountStatisticJSON {
    /**变动总值，某个账户的增加或者减少都会有影响 */
    changeAmount: string;
    /**变动总次数，某个账户的增加或者减少都会有影响 */
    changeCount: number;
    /**资产迁移总量 */
    moveAmount: string;
    /**交易次数统一 */
    transactionCount: number;
  }
  interface AssetStatisticJSON extends AssetInfoJSON {
    index: number;
    typeStatisticHashMap: { [baseType: number]: CountAndAmountStatisticJSON };
    total: CountAndAmountStatisticJSON;
  }

  interface StatisticInfoJSON {
    totalFee: string;
    totalAsset: string;
    totalChainAsset: string;
    totalAccount: number;
    assetStatisticHashMap: { [index: number]: AssetStatisticJSON };
  }
  //#endregion
}

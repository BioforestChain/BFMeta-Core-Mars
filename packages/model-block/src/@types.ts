declare namespace BFChainCore {
  type SomeBlockModel = import("./").SomeBlockModel<any>;

  interface SomeBlockJSON<T extends BlockJSON> {
    block: T;
  }

  /**生成区块体的数据模型 */
  type BlockBody = {
    /**区块版本号 */
    version: number;
    /**区块高度 */
    height: number;
    // /**区块大小 */
    // blockSize?: number;
    /**锻造时间戳 */
    timestamp: number;
    // /**区块签名 */
    // signature?: string;
    /**打块账户公钥 */
    generatorPublicKey: string;
    generatorSecondPublicKey?: string;
    /**打块账户权益 */
    // generatorEquity: string;
    // /**处理的交易量 */
    // numberOfTransactions: number;
    // /**所有交易 hash 值 */
    // payloadHash: string;
    // /**所有交易的 hash 长度 */
    // payloadLength: number;
    /**前块 signature */
    previousBlockSignature?: string;
    // /**总资产数量 */
    // totalAmount: string;
    // /**总手续费 */
    // totalFee: string;
    // /**区块奖励 */
    // reward: string;
    // /**区块版本号 */
    // version: number;
    // /**区块所属的网络标识符 */
    // magic: string;
    /**交易的备注信息 */
    remark?: { [key: string]: string };
  };

  type CommonBlock = import("./atom_block").CommonBlock; //  Block<CommonBlockRemarkJSON>;
  type GenesisBlock = import("./atom_block").GenesisBlock; // Block<GenesisBlockAssetJSON>;
  type RoundLastBlock = import("./atom_block").RoundLastBlock; // Block<RoundLastBlockAssetJSON>;
  type AnyBlock = CommonBlock | GenesisBlock | RoundLastBlock;
  type AnyBlockConstructor =
    | typeof import("./atom_block").CommonBlock
    | typeof import("./atom_block").GenesisBlock
    | typeof import("./atom_block").RoundLastBlock;
}

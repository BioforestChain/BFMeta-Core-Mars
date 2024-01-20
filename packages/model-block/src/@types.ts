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
    /**锻造时间戳 */
    timestamp: number;
    /**打块账户公钥 */
    generatorPublicKey: string;
    /**打块账户安全公钥 */
    generatorSecondPublicKey?: string;
    /**前块 signature */
    previousBlockSignature?: string;
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

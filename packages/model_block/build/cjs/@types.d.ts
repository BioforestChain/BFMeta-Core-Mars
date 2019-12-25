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
        /**前块 id */
        previousBlock?: string;
    };
}
//# sourceMappingURL=@types.d.ts.map
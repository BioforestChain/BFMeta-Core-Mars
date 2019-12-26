import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
import { BLOCK_TYPES_BASE } from "@bfchain/core-model-block";
import { AccountBaseHelper } from "@bfchain/core-helper-account";
declare type RoundLastBlock = import("@bfchain/core-model-block").RoundLastBlock;
export declare class BlockHelper {
    config: ConfigHelper;
    baseHelper: BaseHelper;
    private accountBaseHelper;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    constructor(config: ConfigHelper, baseHelper: BaseHelper, accountBaseHelper: AccountBaseHelper, cryptoHelper: BFChainCore.CryptoHelperInterface, keypairHelper: BFChainCore.KeypairHelperInterface, Buffer: BFChainUtil.BufferConstructor);
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
    /**
     * 获取交易 id
     *
     * @param block
     */
    generateId(block: BFChainCore.Block): string;
    /**是否是合法的区块 ID */
    isValidId(id: string): boolean;
    /**
     * 校验区块的签名是否合法
     */
    verifyBlockSignature(block: BFChainCore.Block, opts?: {
        taskLabel?: string;
    }): void;
    /**
     * 校验区块的 remark 大小
     *
     * @param block
     */
    verifyBlockRemarkSize(block: BFChainCore.Block): void;
    /**
     * 根据区块高度获取区块类型
     *
     * @param height
     */
    parseTypeByHeight(height: number): BLOCK_TYPES_BASE;
    /**获取高度对应的轮次 */
    calcRoundByHeight(height: number): number;
    /**计算离轮末还有多少个区块数
     * `0 ~ blockPerRound-1`
     */
    calcBlockNumberToRoundEnd(cur_height: number): number;
    /**计算一轮的开始的区块高度 */
    calcRoundStartHeight(round_num: number): number;
    /**计算一轮的结束的区块高度 */
    calcRoundEndHeight(round_num: number): number;
    forceGetBlockByHeight<B extends BFChainCore.Block = BFChainCore.Block>(height: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getBlockByHeight"> | undefined): Promise<B>;
    forceGetBlockById<B extends BFChainCore.Block = BFChainCore.Block>(id: string, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getBlockById"> | undefined): Promise<B>;
    forceGetBlockListByHeightRange(min: number, max: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getBlockByHeight"> | undefined): Promise<import("@bfchain/core-model-block").Block<BFChainCore.CommonBlockRemarkJSON>[]>;
    forceGetBlockGeneratorAddressByHeight(height: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getBlockGeneratorPublicKeyBufferByHeight" | "getBlockByHeight"> | undefined): Promise<string>;
    forceGetBlockSignatureByHeight(height: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getBlockSignatureByHeight" | "getBlockByHeight"> | undefined): Promise<Uint8Array>;
    forceGetBlockIdByHeight(height: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getBlockSignatureByHeight" | "getBlockByHeight"> | undefined): Promise<string>;
    getLastBlock(blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getLastBlock"> | undefined): Promise<import("@bfchain/core-model-block").Block<BFChainCore.CommonBlockRemarkJSON>>;
    getCurrentGenerateBlock(blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getCurrentGenerateBlock"> | undefined): Promise<Pick<BFChainCore.NewBlockArgJSON, "generatorPublicKey" | "height" | "previousBlockId" | "timestamp" | "totalFee" | "numberOfTransactions" | "blockParticipation"> | Pick<Readonly<{
        height: number;
        timestamp: number;
        blockParticipation: bigint;
        /**是否是合法的区块 ID */
        numberOfTransactions: number;
        totalFee: bigint;
        blockId: string;
        previousBlockId: string;
    }>, "height" | "previousBlockId" | "timestamp" | "totalFee" | "numberOfTransactions" | "blockParticipation"> | undefined>;
    getCurrentSyncBlockInfo(blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getCurrentSyncBlockInfo"> | undefined): Promise<{
        block: import("@bfchain/core-model-block").Block<BFChainCore.CommonBlockRemarkJSON>;
        blockGetterHelper: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannelInterface>;
        chainChannelGroup?: BFChainCore.ChainChannelGroupInterface<BFChainCore.ChainChannelInterface> | undefined;
    } | undefined>;
    /**
     * 当前正在处理中的区块
     * 可以是锻造中的,也可以是同步中的
     */
    getCurrentProcessingBlockPlotChecker(blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface, "getCurrentGenerateBlock" | "getCurrentSyncBlockInfo"> | undefined): Promise<BFChainCore.BlockPlotChecker | undefined>;
    private _BTC_BLOCK_WM;
    private _BLOCK_BTC_WM;
    parseBlockToPlotChecker(block: BFChainCore.Block): Readonly<{
        height: number;
        timestamp: number;
        blockParticipation: bigint;
        /**是否是合法的区块 ID */
        numberOfTransactions: number;
        totalFee: bigint;
        blockId: string;
        previousBlockId: string;
    }>;
    getBlockFromPlotChecker(blockPlotChecker: BFChainCore.BlockPlotChecker): import("@bfchain/core-model-block").Block<BFChainCore.CommonBlockRemarkJSON> | undefined;
    parseNewBlockToPlotChecker(newBlock: BFChainCore.NewBlockArgJSON | BFChainCore.CurrentGenerateBlockInfo): Readonly<{
        height: number;
        timestamp: number;
        blockParticipation: bigint;
        /**是否是合法的区块 ID */
        numberOfTransactions: number;
        totalFee: bigint;
        blockId: string;
        previousBlockId: string;
    }>;
    parseBlockPlotCheckerListToPlotChecker(list: BFChainCore.BlockPlotChecker[]): Readonly<{
        height: number;
        timestamp: number;
        blockParticipation: bigint;
        /**是否是合法的区块 ID */
        numberOfTransactions: number;
        totalFee: bigint;
        blockId: string;
        previousBlockId: string;
    }>;
    /**计算账户一轮下来对应的权益 */
    calcAccountRoundEquity(accTxCount: number, accBalance: string, roundLastBlock: RoundLastBlock): string;
    /**计算区块的参与度 */
    calcBlockParticipation(args: {
        totalAccount: number;
        totalFee: bigint;
        totalChainAsset: bigint;
        numberOfTransactions: number;
    }): string;
    forceGetBlockGeneratorAddressByRound(round: number, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannelInterface> | undefined): Promise<string[]>;
    /**
     * 计算链上链的hash
     * @param currentHeight
     * @param blockGetterHelper
     */
    calcRoundLastBlockRemarkHash(currentHeight: number, blockGetterHelper?: BFChainUtil.SecondArgument<BlockHelper["forceGetBlockByHeight"]> & BFChainUtil.SecondArgument<BlockHelper["forceGetBlockSignatureByHeight"]>): Promise<string>;
    /**
     * 对比两个受托人的优先级
     * 可以用于sort函数
     * @param itemA
     * @param itemB
     */
    nextRoundDelegatesCompareFn<T extends BFChainCore.ForSortAccountInfo>(itemA: T, itemB: T): 1 | 0 | -1;
    /**
     * 对受托人进行排序
     * @param accountInfoList
     */
    sortInRankAccountInfoList<T extends BFChainCore.ForSortAccountInfo>(accountInfoList: T[]): T[];
}
export {};
//# sourceMappingURL=blockHelper.d.ts.map
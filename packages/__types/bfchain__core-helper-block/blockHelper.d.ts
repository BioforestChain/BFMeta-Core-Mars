import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
import { BLOCK_TYPES_BASE } from "@bfchain/core-model-block";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
declare type RoundLastBlock = import("@bfchain/core-model-block").RoundLastBlock;
export declare class BlockHelper {
    config: ConfigHelper;
    baseHelper: BaseHelper;
    private accountBaseHelper;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    constructor(config: ConfigHelper, baseHelper: BaseHelper, accountBaseHelper: AccountBaseHelper, cryptoHelper: BFChainCore.CryptoHelperInterface, keypairHelper: BFChainCore.KeypairHelperInterface, Buffer: BFChainUtil.BufferConstructor);
    blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;
    generateSignature(block: BFChainCore.Block): string;
    isValidSignature(signature: string): boolean;
    verifyBlockSignature(block: BFChainCore.Block, opts?: {
        taskLabel?: string;
    }): void;
    verifyBlockRemarkSize<RJ extends BFChainCore.CommonBlockRemarkJSON>(blockRemark: BFChainCore.RemarkJSONToModelType<RJ>): void;
    parseTypeByHeight(height: number): BLOCK_TYPES_BASE;
    calcRoundByHeight(height: number): number;
    calcBlockNumberToRoundEnd(cur_height: number): number;
    calcRoundStartHeight(round_num: number): number;
    calcRoundEndHeight(round_num: number): number;
    forceGetBlockByHeight<B extends BFChainCore.Block = BFChainCore.Block>(height: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockByHeight"> | undefined): Promise<B>;
    forceGetBlockBySignature<B extends BFChainCore.Block = BFChainCore.Block>(signature: string, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockBySignature"> | undefined): Promise<B>;
    forceGetBlockListByHeightRange(min: number, max: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockByHeight"> | undefined): Promise<import("@bfchain/core-model-block").Block<BFChainCore.CommonBlockRemarkJSON>[]>;
    forceGetBlockGeneratorAddressByHeight(height: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockGeneratorPublicKeyBufferByHeight" | "getBlockByHeight"> | undefined): Promise<string>;
    forceGetBlockSignatureBufferByHeight(height: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockSignatureByHeight" | "getBlockByHeight"> | undefined): Promise<Uint8Array>;
    forceGetBlockSignatureByHeight(height: number, blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockSignatureByHeight" | "getBlockByHeight"> | undefined): Promise<string>;
    getLastBlock(blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getLastBlock"> | undefined): Promise<import("@bfchain/core-model-block").Block<BFChainCore.CommonBlockRemarkJSON>>;
    getCurrentGenerateBlock(blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getCurrentGenerateBlock"> | undefined): Promise<Pick<BFChainCore.NewBlockArgJSON, "height" | "previousBlockSignature" | "timestamp" | "totalFee" | "numberOfTransactions" | "generatorPublicKey" | "blockParticipation"> | Pick<Readonly<{
        height: number;
        timestamp: number;
        blockParticipation: bigint;
        numberOfTransactions: number;
        totalFee: bigint;
        signature: string;
        previousBlockSignature: string;
    }>, "height" | "previousBlockSignature" | "timestamp" | "totalFee" | "numberOfTransactions" | "blockParticipation"> | undefined>;
    getCurrentReplayingBlockInfo<CC extends BFChainCore.ChainChannel = BFChainCore.ChainChannel>(blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperInterface<CC>, "getCurrentReplayingBlockInfo"> | undefined): Promise<BFChainCore.CurrentReplayingBlockInfo<CC> | undefined>;
    getCurrentProcessingBlockPlotChecker(blockGetterHelper?: Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getCurrentGenerateBlock" | "getCurrentReplayingBlockInfo"> | undefined): Promise<BFChainCore.BlockPlotChecker | undefined>;
    private _BTC_BLOCK_WM;
    private _BLOCK_BTC_WM;
    parseBlockToPlotChecker(block: BFChainCore.Block): Readonly<{
        height: number;
        timestamp: number;
        blockParticipation: bigint;
        numberOfTransactions: number;
        totalFee: bigint;
        signature: string;
        previousBlockSignature: string;
    }>;
    getBlockFromPlotChecker(blockPlotChecker: BFChainCore.BlockPlotChecker): import("@bfchain/core-model-block").Block<BFChainCore.CommonBlockRemarkJSON> | undefined;
    parseNewBlockToPlotChecker(newBlock: BFChainCore.NewBlockArgJSON | BFChainCore.CurrentGeneratingBlockInfo): Readonly<{
        height: number;
        timestamp: number;
        blockParticipation: bigint;
        numberOfTransactions: number;
        totalFee: bigint;
        signature: string;
        previousBlockSignature: string;
    }>;
    parseBlockPlotCheckerListToPlotChecker(list: BFChainCore.BlockPlotChecker[]): Readonly<{
        height: number;
        timestamp: number;
        blockParticipation: bigint;
        numberOfTransactions: number;
        totalFee: bigint;
        signature: string;
        previousBlockSignature: string;
    }>;
    calcAccountRoundEquity(accTxCount: number, accBalance: string, roundLastBlock: RoundLastBlock): string;
    calcBlockParticipation(args: {
        totalAccount: number;
        totalFee: bigint;
        totalChainAsset: bigint;
        numberOfTransactions: number;
    }): string;
    forceGetBlockGeneratorAddressByRound(round: number, blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface | undefined): Promise<string[]>;
    calcRoundLastBlockRemarkHash(currentHeight: number, blockGetterHelper?: BFChainUtil.SecondArgument<BlockHelper["forceGetBlockByHeight"]> & BFChainUtil.SecondArgument<BlockHelper["forceGetBlockSignatureBufferByHeight"]>): Promise<string>;
    nextRoundDelegatesCompareFn<T extends BFChainCore.ForSortAccountInfo>(itemA: T, itemB: T): 1 | 0 | -1;
    sortInRankAccountInfoList<T extends BFChainCore.ForSortAccountInfo>(accountInfoList: T[]): T[];
}
export {};

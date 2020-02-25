import { AsyncIteratorGenerator, QueneEventEmitter } from "@bfchain/util";
import { BaseHelper, ConfigHelper } from "@bfchain/core-helper";
import { Block, CommonBlock, TransactionInBlock } from "@bfchain/core-model";
import { ChainChannel, ChainChannelBase } from "./ChainChannel";
export declare const CHAIN_CHANNEL_GROUP_ARGS: {
    GROUP_NAME: symbol;
    CHANNEL_LIST: symbol;
    OPTIONS: symbol;
};
export declare class ChainChannelGroup<DH extends BFChainCore.ChainChannel = ChainChannel> extends ChainChannelBase implements BFChainCore.ChainChannelGroup<DH> {
    groupName: string;
    protected baseHelper: BaseHelper;
    protected config: ConfigHelper;
    private timeHelper;
    protected chainChannelSet: Set<DH>;
    get size(): number;
    forEach(hanlder: (chainChannel: DH, i: number) => any): void;
    include(chainChannel: DH): boolean;
    [Symbol.iterator](): IterableIterator<DH>;
    options: {
        disableAutoRemove?: boolean;
    };
    constructor(chainChannelList: DH[], groupName?: string, opts?: Partial<ChainChannelGroup["options"]>);
    private _parallelTasksMap;
    private _workCountWM;
    startParallelTask(task_id: string): {
        hasFreeChainChannel: () => boolean;
        getFreeChainChannel: () => DH | Promise<DH>;
        freeChainChannel: (chainChannel: DH) => void;
        busyChainChannel: (chainChannel: DH) => void;
    };
    releaseParallelTask(task_id: string): false | undefined;
    queryTransactions(query: BFChainUtil.FirstArgument<DH["queryTransactions"]>, sort?: BFChainUtil.SecondArgument<DH["queryTransactions"]>, opts?: BFChainUtil.ThirdArgument<DH["queryTransactions"]>, _resultGenerator?: AsyncIteratorGenerator<TransactionInBlock>): AsyncIteratorGenerator<TransactionInBlock<import("@bfchain/core-model").Transaction<object>>>;
    broadcastTransaction(transaction: BFChainCore.NewTransactionArgJSON["transaction"], opts?: BFChainCore.ChannelRequestOptions & {
        max_parallel_num?: number;
    }, event?: QueneEventEmitter<BFChainCore.BroadcastNewTransactionEvents<DH>>): Promise<{
        chainChannel: DH;
        result: {
            error: boolean;
            result: import("@bfchain/core-model").NewTransactionReturnModel | Error;
            chainChannel: DH;
        };
    }[] | undefined>;
    queryBlock(...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>): Promise<import("@bfchain/core-model").QueryBlockReturnModel<Block<BFChainCore.CommonBlockRemarkJSON>>>;
    findBlock<B extends Block = CommonBlock>(...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>): Promise<B | undefined>;
    broadcastBlock(...args: BFChainUtil.AllArgument<ChainChannel["broadcastBlock"]>): Promise<{
        chainChannel: DH;
        result: Promise<import("@bfchain/core-model").NewBlockReturn>;
    }[]>;
    private _DAWCLWM;
    addChainChannel(chainChannel: DH, opts?: {
        disableAutoRemove?: boolean | undefined;
    }): boolean;
    removeChainChannel(chainChannel: DH): boolean;
    private get _chainChannelEvents();
    get onAddChainChannel(): (handler: BFChainUtil.MutArgEventHandler<never>, opts?: BFChainUtil.EventOptions | undefined) => void;
    get onRemoveChainChannel(): (handler: BFChainUtil.MutArgEventHandler<never>, opts?: BFChainUtil.EventOptions | undefined) => void;
    private _eventFollower;
    private addChainChannel_;
    destroy(): void;
}

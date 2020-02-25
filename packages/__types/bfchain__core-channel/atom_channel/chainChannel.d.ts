import { ConfigHelper, BaseHelper, ChainTimeHelper } from "@bfchain/core-helper";
import { Block, QueryTransactionReturnModel, NewTransactionReturnModel, QueryBlockReturnModel, NewBlockReturn, DUPLEX_API_CMD } from "@bfchain/core-model";
import { Message } from "@bfchain/protobuf";
import { ChainChannelHelper } from "./chainChannelHelper";
import { QueneEventEmitterPro, PromiseOut } from "@bfchain/util";
export declare abstract class ChainChannelBase extends QueneEventEmitterPro<BFChainCore.ChainChannelHanlderEventMap> {
    protected abstract config: ConfigHelper;
    protected abstract baseHelper: BaseHelper;
    private _blockGetterHelper?;
    abstract findBlock<B extends Block = Block>(query: BFChainCore.BlockQueryOptionsJSON, opts?: BFChainCore.ChannelRequestOptions | undefined): Promise<B | undefined>;
    toBlockGetterHelper(opts?: {
        maxHeight?: number;
        lastBlock?: Block;
    }): BFChainCore.BlockGetterHelperSimpleInterface & {
        maxHeight: number;
        lastBlock: Block<BFChainCore.CommonBlockRemarkJSON>;
    };
}
export declare class ChainChannel extends ChainChannelBase implements BFChainCore.ChainChannel {
    endpoint: BFChainCore.ChannelEndpointInterface;
    protected transactionCore: import("@bfchain/core-transaction").TransactionCore;
    protected chainChannelHelper: ChainChannelHelper;
    protected config: ConfigHelper;
    protected baseHelper: BaseHelper;
    protected timeHelper: ChainTimeHelper;
    constructor(endpoint: BFChainCore.ChannelEndpointInterface);
    onClose(handler: BFChainUtil.FirstArgument<BFChainCore.ChannelEndpointInterface["onClose"]>, once?: boolean): BFChainCore.EventListenerRemover;
    close(reason?: string): void;
    mayby_height: number;
    protected _delay_histroy_list: Float32Array;
    get delay(): number;
    protected pushDelayHistroy(delay: number): void;
    readonly req_response_map: Map<string | number, PromiseOut<any>>;
    protected _req_id_acc: Uint32Array;
    protected _request<T>(cmd: DUPLEX_API_CMD, data: Message, ResonseBoxer: (bytes: Uint8Array) => T, options?: BFChainCore.ChannelRequestOptions): Promise<T>;
    private _requestDataToBinary;
    _requestWithBinaryData<T>(cmd: DUPLEX_API_CMD, binary: Uint8Array, ResonseBoxer: (bytes: Uint8Array) => T, options?: BFChainCore.ChannelRequestOptions): Promise<T>;
    postResponseMessage(req_id: number, cmd: DUPLEX_API_CMD, binary: Uint8Array): void;
    queryTransactions(query: BFChainCore.QueryTransactionArgJSON["query"], sort?: BFChainCore.QueryTransactionArgJSON["sort"], opts?: BFChainCore.ChannelRequestOptions): Promise<QueryTransactionReturnModel>;
    initBroadcastTransactionArg(transaction: BFChainCore.NewTransactionArgJSON["transaction"], opts?: BFChainCore.ChannelRequestOptions): readonly [DUPLEX_API_CMD.NEW_TRANSACTION, Uint8Array, (params: Uint8Array | ArrayBuffer) => NewTransactionReturnModel, BFChainCore.ChannelRequestOptions];
    broadcastTransaction(transaction: BFChainCore.NewTransactionArgJSON["transaction"], opts?: BFChainCore.ChannelRequestOptions): Promise<NewTransactionReturnModel>;
    queryBlock<B extends Block = Block>(query: BFChainCore.QueryBlockArgJSON["query"], opts?: BFChainCore.ChannelRequestOptions): Promise<QueryBlockReturnModel<B>>;
    findBlock<B extends Block = Block>(...args: BFChainUtil.AllArgument<BFChainCore.ChainChannel["queryBlock"]>): Promise<B | undefined>;
    initBroadcastBlockArg(blockInfo: BFChainCore.NewBlockArgJSON, opts?: BFChainCore.ChannelRequestOptions): readonly [DUPLEX_API_CMD.NEW_BLOCK, Uint8Array, (params: Uint8Array | ArrayBuffer) => NewBlockReturn, BFChainCore.ChannelRequestOptions | undefined];
    broadcastBlock(blockInfo: BFChainCore.NewBlockArgJSON, opts?: BFChainCore.ChannelRequestOptions): Promise<NewBlockReturn>;
    initOnMessage(): void;
}

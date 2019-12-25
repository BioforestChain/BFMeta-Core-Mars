import { ConfigHelper, BaseHelper, ChainTimeHelper } from "@bfchain/core-helper";
import { Block, GetPeerInfoReturnModel, QueryTransactionReturnModel, NewTransactionReturnModel, QueryBlockReturnModel, NewBlockReturn, DUPLEX_API_CMD } from "@bfchain/core-model";
import { Message } from "@bfchain/protobuf";
import { ChainChannelHelper } from "./chainChannelHelper";
import { QueneEventEmitterPro, PromiseOut } from "@bfchain/util";
export declare abstract class ChainChannelBase extends QueneEventEmitterPro<BFChainCore.ChainChannelHanlderEventMap> {
    protected abstract config: ConfigHelper;
    protected abstract baseHelper: BaseHelper;
    abstract findBlock<B extends Block = Block>(query: BFChainCore.BlockQueryOptionsJSON, opts?: BFChainCore.ChannelRequestOptions | undefined): Promise<B | undefined>;
}
/**
 * 为数据收发处理器包装数据处理
 */
export declare class ChainChannel extends ChainChannelBase {
    endpoint: BFChainCore.ChannelEndpointInterface;
    protected transactionCore: import("@bfchain/core-transaction").TransactionCore;
    protected chainChannelHelper: ChainChannelHelper;
    protected config: ConfigHelper;
    protected baseHelper: BaseHelper;
    protected timeHelper: ChainTimeHelper;
    constructor(endpoint: BFChainCore.ChannelEndpointInterface);
    onClose(handler: BFChainUtil.FirstArgument<BFChainCore.ChannelEndpointInterface["onClose"]>, once?: boolean): BFChainCore.EventListenerRemover;
    /**关闭双工连接 */
    close(reason?: string): void;
    /**对方节点可能的高度 */
    mayby_height: number;
    /**存储延迟的历史记录 */
    protected _delay_histroy_list: Float32Array;
    get delay(): number;
    /**存储延迟记录 */
    protected pushDelayHistroy(delay: number): void;
    /**请求的响应回调缓存 */
    readonly req_response_map: Map<string | number, PromiseOut<any>>;
    /**请求ID累加器 */
    protected _req_id_acc: Uint32Array;
    protected _request<T>(cmd: DUPLEX_API_CMD, data: Message, ResonseBoxer: (bytes: Uint8Array) => T, options?: BFChainCore.ChannelRequestOptions): Promise<T>;
    private _requestDataToBinary;
    _requestWithBinaryData<T>(cmd: DUPLEX_API_CMD, binary: Uint8Array, ResonseBoxer: (bytes: Uint8Array) => T, options?: BFChainCore.ChannelRequestOptions): Promise<T>;
    /**发送响应数据 */
    postResponseMessage(req_id: number, cmd: DUPLEX_API_CMD, binary: Uint8Array): void;
    /**查询交易 */
    queryTransactions(query: BFChainCore.QueryTransactionArgJSON["query"], sort?: BFChainCore.QueryTransactionArgJSON["sort"], opts?: BFChainCore.ChannelRequestOptions): Promise<QueryTransactionReturnModel>;
    initBroadcastTransactionArg(transaction: BFChainCore.NewTransactionArgJSON["transaction"], opts?: BFChainCore.ChannelRequestOptions): readonly [DUPLEX_API_CMD.NEW_TRANSACTION, Uint8Array, (params: ArrayBuffer | Uint8Array) => NewTransactionReturnModel, BFChainCore.ChannelRequestOptions];
    /**广播交易体 */
    broadcastTransaction(transaction: BFChainCore.NewTransactionArgJSON["transaction"], opts?: BFChainCore.ChannelRequestOptions): Promise<NewTransactionReturnModel>;
    /**查询区块 */
    queryBlock(query: BFChainCore.QueryBlockArgJSON["query"], opts?: BFChainCore.ChannelRequestOptions): Promise<QueryBlockReturnModel>;
    findBlock<B extends Block = Block>(...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>): Promise<B | undefined>;
    /**广播区块 的传播参数 */
    initBroadcastBlockArg(blockInfo: BFChainCore.NewBlockArgJSON, opts?: BFChainCore.ChannelRequestOptions): readonly [DUPLEX_API_CMD.NEW_BLOCK, Uint8Array, (params: ArrayBuffer | Uint8Array) => NewBlockReturn, BFChainCore.ChannelRequestOptions | undefined];
    /**广播区块 */
    broadcastBlock(blockInfo: BFChainCore.NewBlockArgJSON, opts?: BFChainCore.ChannelRequestOptions): Promise<NewBlockReturn>;
    /**获取节点信息 的传播参数 */
    initGetPeerInfoArg(uid?: BFChainCore.GetPeerInfoArgJSON["uid"], opts?: BFChainCore.ChannelRequestOptions): readonly [DUPLEX_API_CMD.GET_PEER_INFO, Uint8Array, (params: ArrayBuffer | Uint8Array) => GetPeerInfoReturnModel, BFChainCore.ChannelRequestOptions | undefined];
    /**获取节点信息
     * 顺带统计延迟
     */
    getPeerInfo(uid?: BFChainCore.GetPeerInfoArgJSON["uid"], opts?: BFChainCore.ChannelRequestOptions): Promise<GetPeerInfoReturnModel>;
    /**处理接收到数据时的响应 */
    initOnMessage(): void;
}
//# sourceMappingURL=ChainChannel.d.ts.map
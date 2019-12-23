import { Message } from "@bfchain/protobuf";
export declare class NextRoundDelegateModel extends Message<NextRoundDelegateModel> implements BFChainCore.JSONToModelType<BFChainCore.NextRoundDelegateJSON> {
    static INC: number;
    address: string;
    equity: string;
    toJSON(): {
        address: string;
        equity: string;
    };
}
export declare class RoundDelegateRemarkModel<T extends RoundDelegateRemarkModel<T>> extends Message<T> implements BFChainCore.JSONToModelType<BFChainCore.RoundDelegateRemarkJSON> {
    static INC: number;
    /**本轮新增的受托人 */
    newDelegates: string[];
    /**上一轮的最大余额 */
    maxBeginBalance: string;
    /**上一轮的最大交易量 */
    maxTxCount: number;
    /**下一轮的打块账户以及其相关信息 */
    nextRoundDelegates: NextRoundDelegateModel[];
    private _next_round_delegate_address_list?;
    get nextRoundDelegateAddressList(): string[];
    private _equitie_map?;
    get nextRoundDelegateEquitieMap(): Map<string, string>;
    /**最大余额和最大交易量的比值 */
    private _rate?;
    get rate(): string;
    toJSON(): {
        newDelegates: string[];
        maxBeginBalance: string;
        maxTxCount: number;
        nextRoundDelegates: {
            address: string;
            equity: string;
        }[];
        rate: string;
    };
}
//# sourceMappingURL=roundDelegateRemark.d.ts.map
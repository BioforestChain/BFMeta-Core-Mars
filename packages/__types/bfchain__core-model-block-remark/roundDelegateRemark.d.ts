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
    newDelegates: string[];
    maxBeginBalance: string;
    maxTxCount: number;
    nextRoundDelegates: NextRoundDelegateModel[];
    private _next_round_delegate_address_list?;
    get nextRoundDelegateAddressList(): string[];
    private _equitie_map?;
    get nextRoundDelegateEquitieMap(): Map<string, string>;
    private _rate?;
    get rate(): string;
    toJSON(): BFChainCore.RoundDelegateRemarkJSON;
}

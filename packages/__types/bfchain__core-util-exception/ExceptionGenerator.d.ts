export declare function CoreExceptionGenerator(MODULE: string, FILE: string): {
    readonly log: (...args: unknown[]) => void;
    readonly info: (...args: unknown[]) => void;
    readonly success: (...args: unknown[]) => void;
    readonly warn: (...args: unknown[]) => void;
    readonly error: (...args: unknown[]) => void;
} & {
    getException: <E extends BFChainUtil.ExceptionConstructor<BFChainUtil.Exception>>(Con: E) => E;
    readonly Exception: BFChainUtil.ExceptionConstructor<BFChainUtil.Exception>;
    readonly OutOfRangeException: BFChainUtil.ExceptionConstructor<BFChainUtil.OutOfRangeException>;
    readonly ArgumentException: BFChainUtil.ExceptionConstructor<BFChainUtil.ArgumentException>;
    readonly ArgumentIllegalException: BFChainUtil.ExceptionConstructor<BFChainUtil.ArgumentIllegalException>;
    readonly ArgumentFormatException: BFChainUtil.ExceptionConstructor<BFChainUtil.ArgumentFormatException>;
    readonly NoFoundException: BFChainUtil.ExceptionConstructor<BFChainUtil.NoFoundException>;
    readonly ResponseException: BFChainUtil.ExceptionConstructor<BFChainUtil.ResponseException>;
    readonly IOException: BFChainUtil.ExceptionConstructor<BFChainUtil.IOException>;
    readonly NetworkIOException: BFChainUtil.ExceptionConstructor<BFChainUtil.NetworkIOException>;
    readonly BusyIOException: BFChainUtil.ExceptionConstructor<BFChainUtil.BusyIOException>;
    readonly DatebaseIOException: BFChainUtil.ExceptionConstructor<BFChainUtil.DatebaseIOException>;
    readonly InterruptedException: BFChainUtil.ExceptionConstructor<BFChainUtil.InterruptedException>;
    readonly IllegalStateException: BFChainUtil.ExceptionConstructor<BFChainUtil.IllegalStateException>;
    readonly TimeOutException: BFChainUtil.ExceptionConstructor<BFChainUtil.TimeOutException>;
    readonly BusyException: BFChainUtil.ExceptionConstructor<BFChainUtil.BusyException>;
    readonly ConsensusException: BFChainUtil.ExceptionConstructor<BFChainUtil.ConsensusException>;
    readonly AbortException: BFChainUtil.ExceptionConstructor<BFChainUtil.AbortException>;
    readonly RefuseException: BFChainUtil.ExceptionConstructor<BFChainUtil.RefuseException>;
};

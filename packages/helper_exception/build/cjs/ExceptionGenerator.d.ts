/// <reference types="node" />
export declare function CoreExceptionGenerator(MODULE: string, FILE: string): {
    log: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    success: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
} & {
    getException: <E extends typeof import("@bfchain/util-exception").Exception>(Con: E) => {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    Exception: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    OutOfRangeException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    ArgumentException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    ArgumentIllegalException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    ArgumentFormatException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    NoFoundException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    IOException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    NetworkIOException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    BusyIOException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    DatebaseIOException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    InterruptedException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    IllegalStateException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    ResponseException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    TimeOutException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    BusyException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    ConsensusException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    AbortException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
    RefuseException: {
        new (message?: string | undefined, detail?: any): {
            readonly type: string;
            detail: any;
            PLATFORM: string;
            CHANNEL: string;
            BUSINESS: string;
            MODULE: string;
            FILE: string;
            CODE: string;
            name: string;
            message: string;
            stack?: string | undefined;
        };
        TYPE: string;
        is(err: import("@bfchain/util-exception").Exception): err is import("@bfchain/util-exception").Exception;
        captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
};
//# sourceMappingURL=ExceptionGenerator.d.ts.map
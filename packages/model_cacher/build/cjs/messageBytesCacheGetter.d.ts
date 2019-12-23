interface getBytesFunction extends CallableFunction {
    (...args: any[]): Uint8Array;
}
export declare function cacheBytesGetter<T extends getBytesFunction>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T>;
export {};
//# sourceMappingURL=messageBytesCacheGetter.d.ts.map
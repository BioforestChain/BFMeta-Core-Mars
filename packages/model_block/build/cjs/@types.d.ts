declare namespace BFChainCore {
    type SomeBlockModel = import("./").SomeBlockModel<any>;
    interface SomeBlockJSON<T extends BlockJSON> {
        block: T;
    }
}
//# sourceMappingURL=@types.d.ts.map
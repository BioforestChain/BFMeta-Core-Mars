declare namespace BFChainCore {
    type SomeBlockModel = import("./").SomeBlockModel<any>;
    interface SomeBlockJSON<T extends BlockJSON> {
        block: T;
    }
    type BlockBody = {
        version: number;
        height: number;
        timestamp: number;
        generatorPublicKey: string;
        previousBlockSignature?: string;
    };
    type CommonBlock = import("./atom_block").CommonBlock;
    type GenesisBlock = import("./atom_block").GenesisBlock;
    type RoundLastBlock = import("./atom_block").RoundLastBlock;
    type AnyBlock = CommonBlock | GenesisBlock | RoundLastBlock;
    type AnyBlockConstructor = typeof import("./atom_block").CommonBlock | typeof import("./atom_block").GenesisBlock | typeof import("./atom_block").RoundLastBlock;
}

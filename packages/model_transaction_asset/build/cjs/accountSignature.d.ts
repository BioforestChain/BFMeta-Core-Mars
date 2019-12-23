import { Message } from "@bfchain/protobuf";
export declare class AccountSignatureModel extends Message<AccountSignatureModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.AccountSignatureJSON> {
    static INC: number;
    publicKeyBuffer: Uint8Array;
    get publicKey(): string;
    set publicKey(value: string);
    signatureBuffer: Uint8Array;
    get signature(): string;
    set signature(value: string);
    secondPublicKeyBuffer?: Uint8Array;
    get secondPublicKey(): string | undefined;
    set secondPublicKey(value: string | undefined);
    signSignatureBuffer?: Uint8Array;
    get signSignature(): string | undefined;
    set signSignature(value: string | undefined);
    toJSON(): BFChainCore.AccountSignatureJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<AccountSignatureModel>): T;
}
//# sourceMappingURL=accountSignature.d.ts.map
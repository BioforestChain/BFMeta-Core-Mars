import { Message, Field, Type } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";

/**
 * registerChain 交易 asset 模型
 *
 */
@Type.d("RegisterChainModel")
export class RegisterChainModel
  extends Message<RegisterChainModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RegisterChainJSON>
{
  /**创世块 */
  @Field.d(1, "bytes")
  genesisBlockBuffer!: Uint8Array;
  public get genesisBlock(): string {
    return getHexFromArrayBuffer(this.genesisBlockBuffer);
  }
  public set genesisBlock(value: string) {
    this.genesisBlockBuffer = parseHexToArrayBuffer(value);
  }
  toJSON() {
    return {
      genesisBlock: this.genesisBlock,
    };
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<RegisterChainModel>,
  ) {
    const res = super.fromObject(object) as RegisterChainModel;
    if (res !== object) {
      object.genesisBlock && (res.genesisBlock = object.genesisBlock);
    }
    return res as unknown as T;
  }
}

/**
 * registerChain 交易 asset 外层模型
 *
 */
@Type.d("RegisterChainAssetModel")
export class RegisterChainAssetModel
  extends Message<RegisterChainAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RegisterChainAssetJSON>
{
  @Field.d(1, RegisterChainModel)
  registerChain!: RegisterChainModel;
  toJSON() {
    return {
      registerChain: this.registerChain.toJSON(),
    };
  }
}

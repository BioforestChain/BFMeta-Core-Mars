import { Message, Type, Field } from "@bfchain/protobuf";
import { RoundDelegateRemarkModel } from "./roundDelegateRemark";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";

@Type.d("RoundLastBlockRemarkModel")
export class RoundLastBlockRemarkModel extends RoundDelegateRemarkModel<RoundLastBlockRemarkModel>
  implements BFChainCore.RemarkJSONToModelType<BFChainCore.RoundLastBlockRemarkJSON> {
  /**区块处理信息 */
  @Field.d(RoundLastBlockRemarkModel.INC++, "string")
  debug!: string;
  /**备注信息 */
  @Field.d(RoundLastBlockRemarkModel.INC++, "string")
  info!: string;
  /**区块参与度 */
  @Field.d(RoundLastBlockRemarkModel.INC++, "string")
  blockParticipation!: string;

  /**链上链区块HASH, 包含当轮除最后一个区块外的区块signature以及上一轮 hash 合并后生成的hash*/
  @Field.d(RoundLastBlockRemarkModel.INC++, "bytes")
  hashBuffer!: Uint8Array;
  get hash(): string {
    return getHexFromArrayBuffer(this.hashBuffer);
  }
  set hash(value: string) {
    this.hashBuffer = parseHexToArrayBuffer(value);
  }
  toJSON() {
    return Object.assign(super.toJSON(), {
      debug: this.debug,
      info: this.info,
      blockParticipation: this.blockParticipation,
      hash: this.hash,
    });
  }
  @cacheBytesGetter
  getBytes() {
    return this.$type.encode(this).finish();
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<RoundLastBlockRemarkModel>,
  ) {
    const res = super.fromObject(object) as RoundLastBlockRemarkModel;
    if (res !== object) {
      object.hash && (res.hash = object.hash);
    }
    return (res as unknown) as T;
  }
}

import { Type, Field, Message, Reader } from "./@bfchain/protobuf";

abstract class Trs<T extends object = object> extends Message<Trs<T>> {
  abstract asset: T;
  @Field.d(0, "string")
  id!: string;
  @Field.d(1, "string")
  type!: string;
  @Field.d(2, "bytes")
  pk!: ArrayBuffer;
}
@Type.d("SendModel")
class SendModel extends Message {
  @Field.d(0, "string")
  test_str!: string;
  @Field.d(1, "uint32")
  test_number!: number;
}
@Type.d("SendAsset")
class SendAssetModel extends Message {
  @Field.d(0, SendModel)
  send!: SendModel;
}
@Type.d("SendTrs")
class SendTrs extends Trs<SendAssetModel> {
  @Field.d(3, SendAssetModel)
  asset!: SendAssetModel;
  static init(obj: any) {
    return this.fromObject({
      ...obj,
      asset: SendAssetModel.fromObject({
        send: SendModel.fromObject(obj.asset.send),
      }),
    });
  }
}

const sendTrs = SendTrs.init({
  id: "myid3",
  type: "mytype",
  pk: Buffer.from("ff", "hex"),
  asset: {
    send: {
      test_str: "tt",
      test_number: 233,
    },
  },
});

console.log(sendTrs);
console.log(Buffer.from(SendTrs.encode(sendTrs).finish()).toString("hex"));

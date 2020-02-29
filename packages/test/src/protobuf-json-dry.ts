import { bfchainCore } from "./include";
import "../src/model";
import { Type, Field, Message, util } from "@bfchain/protobuf";
import { JSONDryFactory } from "json-dry-factory";
import { TransferAssetTransactionFactory, RANGE_TYPE } from "@bfchain/core";
const jsonDry = new JSONDryFactory("protobuf");

@Type.d("QAQ")
class QAQ extends Message<QAQ> {
  @Field.d(1, "string")
  name!: string;
}
@Type.d("QUQ")
class QUQ extends Message<QAQ> {
  @Field.d(1, "uint32")
  age!: number;
}

if (util.decorateRoot.nested) {
  const backupToJSON = Symbol("toJSON");
  Object.keys(util.decorateRoot.nested).forEach(name => {
    const ref = util.decorateRoot.get(name) as Type | null;
    if (!ref) {
      return;
    }
    const ctor = (ref as any)._ctor;
    if (!ctor) {
      return;
    }
    if (!ctor.prototype[backupToJSON]) {
      const sourceToJSON = ctor.prototype.toJSON;
      if (sourceToJSON) {
        ctor.prototype[backupToJSON] = sourceToJSON;
        ctor.prototype.toJSON = function(...args: any[]) {
          if (jsonDry.is_in_stringify) {
            return this;
          }
          return this[backupToJSON](...args);
        };
      }
    }
    jsonDry.registerClass<string, Message>(ctor, {
      name: "PB::" + name,
      toDry(v) {
        return Buffer.from(ref.encode(v).finish()).toString("latin1");
      },
      unDry(v) {
        const buf = Buffer.from(v, "latin1");
        return ref.decode(buf);
      },
    });
  });
}

/// do Test
const qaq = new QAQ();
qaq.name = "gaubee";

const quq = new QUQ();
quq.age = 66;
(async () => {
  const trs = await bfchainCore.transaction.createTransaction(
    TransferAssetTransactionFactory,
    {
      version: 1,
      type: bfchainCore.transactionHelper.TRANSFER_ASSET,
      applyBlockHeight: 2,
      numberOfEffectiveBlocks: 100,
      timestamp: 500,
      senderId: await bfchainCore.accountBaseHelper.getAddressFromPublicKey(
        (await bfchainCore.accountBaseHelper.createSecretKeypair("1")).publicKey,
      ),
      senderPublicKey: (
        (await bfchainCore.accountBaseHelper.createSecretKeypair("1")).publicKey
      ).toString("hex"),
      rangeType: RANGE_TYPE.EMPTY,
      range: [
        await bfchainCore.accountBaseHelper.getAddressFromPublicKey(
          (await bfchainCore.accountBaseHelper.createSecretKeypair("2")).publicKey,
        ),
      ],
      fee: "23",
      dappid: "",
      lns: "",
      sourceIP: "",
      fromMagic: bfchainCore.config.magic,
      toMagic: bfchainCore.config.magic,
      remark: {},
    },
    {
      transferAsset: {
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        assetType: bfchainCore.config.assetType,
        amount: "10",
      },
    },
    await bfchainCore.accountBaseHelper.createSecretKeypair("1"),
  );

  const json = jsonDry.stringify({ qaq, quq, trs, xx: /cs/ });
  console.log(json);
  console.log(jsonDry.parse(json));
})();

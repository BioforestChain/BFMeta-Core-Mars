import { V2_GenesisBlockFactory } from "./atom-patch";
import { PatchBase } from "@bfchain/core-patch-base";
import { Type, Reader, Writer } from "@bfchain/protobuf";
import { Injectable, Inject, deepMix } from "@bfchain/util";
import { EventLogicVerifier } from "@bfchain/core-transaction-logic-verifier";
import { BLOCK_FACTORY_TYPES_MAP, GenesisBlockFactory, BlockCore } from "@bfchain/core-block";
import {
  BLOCK_TYPES_BASE,
  GenesisAssetModel,
  GenesisAssetV0Model,
  GenesisAssetV1Model,
  FractionBigIntModel,
  Block,
  CommonBlock,
  GenesisBlock,
  RoundLastBlock,
  BlockVersionReader,
  BNID_TYPE,
  TransactionInBlock,
} from "@bfchain/core-model";

const GenesisAssetModelSetup = GenesisAssetModel.$type.setup();

const GenesisAssetV1Model_encode = GenesisAssetV1Model.encode;
const GenesisAssetV1Model_decode = GenesisAssetV1Model.decode;
const GenesisAssetV1Model_fromObject = GenesisAssetV1Model.fromObject;
const GenesisAssetV1ModelSetup = GenesisAssetV1Model.$type.setup();
const GenesisAssetV1ModelSetup_encode = GenesisAssetV1ModelSetup.encode;
const GenesisAssetV1ModelSetup_decode = GenesisAssetV1ModelSetup.decode;
const GenesisAssetV1ModelSetup_fromObject = GenesisAssetV1ModelSetup.fromObject;

const GenesisAssetV0Model_encode = GenesisAssetV0Model.encode;
const GenesisAssetV0Model_decode = GenesisAssetV0Model.decode;
const GenesisAssetV0Model_fromObject = GenesisAssetV0Model.fromObject;
const GenesisAssetV0ModelSetup = GenesisAssetV0Model.$type.setup();
const GenesisAssetV0ModelSetup_encode = GenesisAssetV0ModelSetup.encode;
const GenesisAssetV0ModelSetup_decode = GenesisAssetV0ModelSetup.decode;
const GenesisAssetV0ModelSetup_fromObject = GenesisAssetV0ModelSetup.fromObject;

const Block_replayBlock = BlockCore.prototype.replayBlock;

@Injectable()
export class V2_Patch extends PatchBase {
  @Inject(EventLogicVerifier)
  eventLogicVerifier!: EventLogicVerifier;

  readonly name = "patch-v2";
  // FIXNE: 先这样，后面再想办法搞
  readonly patchEffectiveAfterHeight =
    this.config.chainName === "bfchain" && this.config.bnid === BNID_TYPE.MAINNET ? 144486 : 0;
  protected _version = 1;
  readonly consensusVersion = 2;
  async upgradeHandler(oldVersion: number, newVersion: number) {
    switch (oldVersion) {
      case 0: {
        {
          /**在合适的条件下，更新共识
           * 如果需要，执行数据库升级。。。。
           */
          this.planAfterHeight(
            this.patchEffectiveAfterHeight,
            () => {
              for (const Block of [CommonBlock, GenesisBlock, RoundLastBlock]) {
                const BlockSetup = Block.$type.setup();
                const BlockSetup_encode = BlockSetup.encode;
                const BlockSetup_encode_v2 = function (this: Type, block: Block, writer?: Writer) {
                  try {
                    const version = block.version;
                    // const asset = (block.asset as any).genesisAsset;
                    if (version > 1) {
                      GenesisAssetModel.encode = GenesisAssetV1Model_encode;
                      GenesisAssetModelSetup.encode = GenesisAssetV1ModelSetup_encode;
                      BLOCK_FACTORY_TYPES_MAP.KF.set(
                        BLOCK_TYPES_BASE.GENESIS,
                        V2_GenesisBlockFactory,
                      );
                      BLOCK_FACTORY_TYPES_MAP.FK.set(
                        V2_GenesisBlockFactory,
                        BLOCK_TYPES_BASE.GENESIS,
                      );
                    } else {
                      GenesisAssetModel.encode = GenesisAssetV0Model_encode;
                      GenesisAssetModelSetup.encode = GenesisAssetV0ModelSetup_encode;
                      BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
                      BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
                    }

                    return BlockSetup_encode.call(this, block, writer);
                  } finally {
                    GenesisAssetModel.encode = GenesisAssetV0Model_encode;
                    GenesisAssetModelSetup.encode = GenesisAssetV0ModelSetup_encode;
                    BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
                    BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
                  }
                };

                const BlockSetup_decode = BlockSetup.decode;
                const BlockSetup_decode_v2 = function (this: Type, reader: Uint8Array | Reader) {
                  try {
                    const versionInfo = BlockVersionReader.decode(
                      reader instanceof Reader ? reader.buf : reader,
                    );
                    const version = versionInfo.version;
                    if (version > 1) {
                      GenesisAssetModel.decode = GenesisAssetV1Model_decode;
                      GenesisAssetModelSetup.decode = GenesisAssetV1ModelSetup_decode;
                      BLOCK_FACTORY_TYPES_MAP.KF.set(
                        BLOCK_TYPES_BASE.GENESIS,
                        V2_GenesisBlockFactory,
                      );
                      BLOCK_FACTORY_TYPES_MAP.FK.set(
                        V2_GenesisBlockFactory,
                        BLOCK_TYPES_BASE.GENESIS,
                      );
                    } else {
                      GenesisAssetModel.decode = GenesisAssetV0Model_decode;
                      GenesisAssetModelSetup.decode = GenesisAssetV0ModelSetup_decode;
                      BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
                      BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
                    }
                    return BlockSetup_decode.call(this, reader);
                  } finally {
                    GenesisAssetModel.decode = GenesisAssetV0Model_decode;
                    GenesisAssetModelSetup.decode = GenesisAssetV0ModelSetup_decode;
                    BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
                    BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
                  }
                };

                const BlockSetup_fromObject = BlockSetup.fromObject;
                BlockSetup.src_fromObject = GenesisAssetModelSetup.fromObject;
                const BlockSetup_fromObject_v2 = function (
                  this: BFChainProtobuf.Constructor<any>,
                  object: BFChainProtobuf.ObjectFromType<
                    BFChainCore.BlockJSON<BFChainCore.GetBlockMessageAssetModel<any>>
                  >,
                ) {
                  try {
                    const version = object.version as number;
                    if (version > 1) {
                      GenesisAssetModel.fromObject = GenesisAssetV1Model_fromObject;
                      GenesisAssetModelSetup.fromObject = GenesisAssetV1ModelSetup_fromObject;
                      BLOCK_FACTORY_TYPES_MAP.KF.set(
                        BLOCK_TYPES_BASE.GENESIS,
                        V2_GenesisBlockFactory,
                      );
                      BLOCK_FACTORY_TYPES_MAP.FK.set(
                        V2_GenesisBlockFactory,
                        BLOCK_TYPES_BASE.GENESIS,
                      );
                    } else {
                      GenesisAssetModel.fromObject = GenesisAssetV0Model_fromObject;
                      GenesisAssetModelSetup.fromObject = GenesisAssetV0ModelSetup_fromObject;
                      BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
                      BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
                    }
                    return BlockSetup_fromObject.call(this, object);
                  } finally {
                    GenesisAssetModel.fromObject = GenesisAssetV0Model_fromObject;
                    GenesisAssetModelSetup.fromObject = GenesisAssetV0ModelSetup_fromObject;
                    BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
                    BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
                  }
                };

                BlockSetup.encode = BlockSetup_encode_v2;
                BlockSetup.decode = BlockSetup_decode_v2;
                BlockSetup.fromObject = BlockSetup_fromObject_v2;
              }

              this.block.replayBlock = function <T extends Block>(
                block: T,
                transactions: AsyncIterable<TransactionInBlock>,
                eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
                options: BFChainCore.ReplayBlockOptions = {},
              ) {
                try {
                  if (block.height === 1) {
                    if (block.version > 1) {
                      BLOCK_FACTORY_TYPES_MAP.KF.set(
                        BLOCK_TYPES_BASE.GENESIS,
                        V2_GenesisBlockFactory,
                      );
                      BLOCK_FACTORY_TYPES_MAP.FK.set(
                        V2_GenesisBlockFactory,
                        BLOCK_TYPES_BASE.GENESIS,
                      );
                    } else {
                      BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
                      BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
                    }
                  }
                  return Block_replayBlock.call(this, block, transactions, eventEmitter, options);
                } finally {
                  BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
                  BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
                }
              };

              const oldBlock = this.config.getHookGenesisBlock(this.consensusVersion) || {};
              // FIXNE: 先这样，后面再想办法搞
              if (this.config.chainName === "bfchain") {
                oldBlock.asset = deepMix(oldBlock.asset, {
                  genesisAsset: {
                    maxMultipleOfAssetAndMainAsset: FractionBigIntModel.fromObject({
                      numerator: "100000",
                      denominator: "1",
                    }),
                  },
                });
              }

              this.config.setHookGenesisBlock(this.consensusVersion, oldBlock);
            },
            () => {
              this.config.rollBackHookGenesisBlock(this.consensusVersion);
            },
          );
        }
      }
    }
  }
}

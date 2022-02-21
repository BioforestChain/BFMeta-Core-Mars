import { V4_GenesisBlockFactory } from "./atom-patch";
import { PatchBase } from "@bfchain/core-patch-base";
import { Type, Reader, Writer } from "@bfchain/protobuf";
import { Injectable, Inject, EasyMap } from "@bfchain/util";
import { EventLogicVerifier } from "@bfchain/core-transaction-logic-verifier";
import { BlockGeneratorCalculator, BLOCK_FACTORY_TYPES_MAP } from "@bfchain/core-block";
import {
  BLOCK_TYPES_BASE,
  GenesisAssetModel,
  GenesisAssetV1Model,
  GenesisAssetV0Model,
  Block,
  CommonBlock,
  GenesisBlock,
  RoundLastBlock,
  BlockVersionReader,
  BNID_TYPE,
} from "@bfchain/core-model";
import { V2_GenesisBlockFactory } from "@bfchain/core-patch-v2";
import { GenesisBlockFactory } from "@bfchain/core-block";

const GenesisAssetModel_encode = GenesisAssetModel.encode;
const GenesisAssetModel_decode = GenesisAssetModel.decode;
const GenesisAssetModel_fromObject = GenesisAssetModel.fromObject;
const GenesisAssetModelSetup = GenesisAssetModel.$type.setup();
const GenesisAssetModelSetup_encode = GenesisAssetModelSetup.encode;
const GenesisAssetModelSetup_decode = GenesisAssetModelSetup.decode;
const GenesisAssetModelSetup_fromObject = GenesisAssetModelSetup.fromObject;

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

@Injectable()
export class V4_Patch extends PatchBase {
  @Inject(EventLogicVerifier)
  eventLogicVerifier!: EventLogicVerifier;
  @Inject(BlockGeneratorCalculator)
  blockGeneratorCalculator!: BlockGeneratorCalculator;

  readonly name = "patch-v4";
  // FIXNE: 先这样，后面再想办法搞
  readonly patchEffectiveAfterHeight =
    this.config.chainName === "bfchain" && this.config.bnid === BNID_TYPE.MAINNET ? 361950 : 0;
  protected _version = 1;
  readonly consensusVersion = 4;
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
                const BlockSetup_encode_v4 = function (this: Type, block: Block, writer?: Writer) {
                  try {
                    const version = block.version;
                    if (version > 3) {
                      const asset = (block.asset as any).genesisAsset;
                      if (asset) {
                        GenesisAssetModel.encode = GenesisAssetModel_encode;
                        GenesisAssetModelSetup.encode = GenesisAssetModelSetup_encode;
                        BLOCK_FACTORY_TYPES_MAP.KF.set(
                          BLOCK_TYPES_BASE.GENESIS,
                          V4_GenesisBlockFactory,
                        );
                        BLOCK_FACTORY_TYPES_MAP.FK.set(
                          V4_GenesisBlockFactory,
                          BLOCK_TYPES_BASE.GENESIS,
                        );
                      }
                    } else if (version > 1) {
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
                const BlockSetup_decode_v4 = function (this: Type, reader: Uint8Array | Reader) {
                  try {
                    const versionInfo = BlockVersionReader.decode(
                      reader instanceof Reader ? reader.buf : reader,
                    );
                    const version = versionInfo.version;
                    if (version > 3) {
                      GenesisAssetModel.decode = GenesisAssetModel_decode;
                      GenesisAssetModelSetup.decode = GenesisAssetModelSetup_decode;
                      BLOCK_FACTORY_TYPES_MAP.KF.set(
                        BLOCK_TYPES_BASE.GENESIS,
                        V4_GenesisBlockFactory,
                      );
                      BLOCK_FACTORY_TYPES_MAP.FK.set(
                        V4_GenesisBlockFactory,
                        BLOCK_TYPES_BASE.GENESIS,
                      );
                    } else if (version > 1) {
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
                const BlockSetup_fromObject_v4 = function (
                  this: BFChainProtobuf.Constructor<any>,
                  object: BFChainProtobuf.ObjectFromType<
                    BFChainCore.BlockJSON<BFChainCore.GetBlockMessageAssetModel<any>>
                  >,
                ) {
                  try {
                    const version = object.version as number;
                    if (version > 3) {
                      GenesisAssetModel.fromObject = GenesisAssetModel_fromObject;
                      GenesisAssetModelSetup.fromObject = GenesisAssetModelSetup_fromObject;
                      BLOCK_FACTORY_TYPES_MAP.KF.set(
                        BLOCK_TYPES_BASE.GENESIS,
                        V4_GenesisBlockFactory,
                      );
                      BLOCK_FACTORY_TYPES_MAP.FK.set(
                        V4_GenesisBlockFactory,
                        BLOCK_TYPES_BASE.GENESIS,
                      );
                    } else if (version > 1) {
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

                BlockSetup.encode = BlockSetup_encode_v4;
                BlockSetup.decode = BlockSetup_decode_v4;
                BlockSetup.fromObject = BlockSetup_fromObject_v4;
              }

              const oldBlock = this.config.getHookGenesisBlock(this.consensusVersion) || {};
              this.config.setHookGenesisBlock(this.consensusVersion, oldBlock);
              this.blockGeneratorCalculator.getAddressSeedMap = (seed: number) => {
                const 种子与地址结果值缓存 = new EasyMap((address: string) => {
                  let num = 0;
                  for (let i = 1; i < address.length; i++) {
                    num += address.charCodeAt(i);
                  }
                  return (num * seed) % 256;
                });
                return 种子与地址结果值缓存;
              };
            },
            () => {
              this.config.rollBackHookGenesisBlock(this.consensusVersion);

              this.blockGeneratorCalculator.getAddressSeedMap = (seed: number) => {
                const 种子与地址结果值缓存 = new EasyMap((address: string) => {
                  let num = 0;
                  for (let i = 1; i < address.length; i++) {
                    num += address.charCodeAt(i);
                  }
                  return num * seed;
                });
                return 种子与地址结果值缓存;
              };
            },
          );
        }
      }
    }
  }
}

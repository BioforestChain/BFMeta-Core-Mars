import { V4_GenesisBlockFactory } from "./atom-patch";
import { PatchBase } from "@bfchain/core-patch-base";
import { Type, Reader } from "@bfchain/protobuf";
import { Injectable, Inject } from "@bfchain/util";
import { EventLogicVerifier } from "@bfchain/core-transaction-logic-verifier";
import { BLOCK_FACTORY_TYPES_MAP } from "@bfchain/core-block";
import {
  BLOCK_TYPES_BASE,
  GenesisAssetModel,
  GenesisAssetV1Model,
  Block,
  CommonBlock,
  GenesisBlock,
  RoundLastBlock,
  BlockVersionReader,
} from "@bfchain/core-model";
import { V2_GenesisBlockFactory } from "@bfchain/core-patch-v2";

const GenesisAssetModelSetup = GenesisAssetModel.$type.setup();
const GenesisAssetModel_encode = GenesisAssetModelSetup.encode;
const GenesisAssetModel_decode = GenesisAssetModelSetup.decode;

const GenesisAssetV1ModelSetup = GenesisAssetV1Model.$type.setup();
const GenesisAssetV1Model_encode = GenesisAssetV1ModelSetup.encode;
const GenesisAssetV1Model_decode = GenesisAssetV1ModelSetup.decode;

@Injectable()
export class V4_Patch extends PatchBase {
  @Inject(EventLogicVerifier)
  eventLogicVerifier!: EventLogicVerifier;

  readonly name = "patch-v4";
  // FIXNE: 先这样，后面再想办法搞
  readonly patchEffectiveAfterHeight = this.config.chainName === "bfchain" ? 305000 : 0;
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
                const BlockSetup_encode_v4 = function (this: Type, block: Block) {
                  try {
                    if (block.version > 3) {
                      const asset = (block.asset as any).genesisAsset;
                      if (asset) {
                        GenesisAssetModelSetup.encode = GenesisAssetModel_encode;
                      }
                    }
                    return BlockSetup_encode.call(this, block);
                  } finally {
                    GenesisAssetModelSetup.encode = GenesisAssetV1Model_encode;
                  }
                };

                const BlockSetup_decode = BlockSetup.decode;
                const BlockSetup_decode_v4 = function (this: Type, reader: Uint8Array | Reader) {
                  try {
                    const versionInfo = BlockVersionReader.decode(
                      reader instanceof Reader ? reader.buf : reader,
                    );
                    if (versionInfo.version > 3) {
                      GenesisAssetModelSetup.decode = GenesisAssetModel_decode;
                    }
                    return BlockSetup_decode.call(this, reader);
                  } finally {
                    GenesisAssetModelSetup.decode = GenesisAssetV1Model_decode;
                  }
                };

                BlockSetup.encode = BlockSetup_encode_v4;
                BlockSetup.decode = BlockSetup_decode_v4;
              }

              const oldBlock = this.config.getHookGenesisBlock(this.consensusVersion) || {};
              this.config.setHookGenesisBlock(this.consensusVersion, oldBlock);
              BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, V4_GenesisBlockFactory);
              BLOCK_FACTORY_TYPES_MAP.FK.set(V4_GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
            },
            () => {
              for (const Block of [CommonBlock, GenesisBlock, RoundLastBlock]) {
                const BlockSetup = Block.$type.setup();
                BlockSetup.encode = GenesisAssetV1Model_encode;
                BlockSetup.decode = GenesisAssetV1Model_decode;
              }

              this.config.rollBackHookGenesisBlock(this.consensusVersion);
              BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, V2_GenesisBlockFactory);
              BLOCK_FACTORY_TYPES_MAP.FK.set(V2_GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
            },
          );
        }
      }
    }
  }
}

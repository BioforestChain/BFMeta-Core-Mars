import { V2_GenesisBlockFactory } from "./atom-patch";
import { PatchBase } from "@bfchain/core-patch-base";
import { Type, Reader, Writer } from "@bfchain/protobuf";
import { Injectable, Inject, deepMix } from "@bfchain/util";
import { EventLogicVerifier } from "@bfchain/core-transaction-logic-verifier";
import { BLOCK_FACTORY_TYPES_MAP, GenesisBlockFactory } from "@bfchain/core-block";
import {
  BLOCK_TYPES_BASE,
  GenesisAssetModel,
  GenesisAssetV0Model,
  FractionBigIntModel,
  Block,
  CommonBlock,
  GenesisBlock,
  RoundLastBlock,
  BlockVersionReader,
  BNID_TYPE,
} from "@bfchain/core-model";

const GenesisAssetModelSetup = GenesisAssetModel.$type.setup();
const GenesisAssetModel_encode = GenesisAssetModelSetup.encode;
const GenesisAssetModel_decode = GenesisAssetModelSetup.decode;

const GenesisAssetV0ModelSetup = GenesisAssetV0Model.$type.setup();
const GenesisAssetV0Model_encode = GenesisAssetV0ModelSetup.encode;
const GenesisAssetV0Model_decode = GenesisAssetV0ModelSetup.decode;

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
                    if (block.version > 1) {
                      const asset = (block.asset as any).genesisAsset;
                      if (asset) {
                        GenesisAssetModelSetup.encode = GenesisAssetModel_encode;
                      }
                    }

                    return BlockSetup_encode.call(this, block, writer);
                  } finally {
                    GenesisAssetModelSetup.encode = GenesisAssetV0Model_encode;
                  }
                };

                const BlockSetup_decode = BlockSetup.decode;
                const BlockSetup_decode_v2 = function (this: Type, reader: Uint8Array | Reader) {
                  try {
                    const versionInfo = BlockVersionReader.decode(
                      reader instanceof Reader ? reader.buf : reader,
                    );
                    if (versionInfo.version > 1) {
                      GenesisAssetModelSetup.decode = GenesisAssetModel_decode;
                    }
                    return BlockSetup_decode.call(this, reader);
                  } finally {
                    GenesisAssetModelSetup.decode = GenesisAssetV0Model_decode;
                  }
                };

                BlockSetup.encode = BlockSetup_encode_v2;
                BlockSetup.decode = BlockSetup_decode_v2;
              }

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
              BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, V2_GenesisBlockFactory);
              BLOCK_FACTORY_TYPES_MAP.FK.set(V2_GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
            },
            () => {
              for (const Block of [CommonBlock, GenesisBlock, RoundLastBlock]) {
                const BlockSetup = Block.$type.setup();
                BlockSetup.encode = GenesisAssetV0Model_encode;
                BlockSetup.decode = GenesisAssetV0Model_decode;
              }

              this.config.rollBackHookGenesisBlock(this.consensusVersion);
              BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
              BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
            },
          );
        }
      }
    }
  }
}

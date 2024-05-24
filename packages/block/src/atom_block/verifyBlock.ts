import type { Block } from "@bfchain/core-model-block";
import { TransactionInBlock, TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
import {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  AsymmetricHelper,
  ChainAssetInfoHelper,
  BlockBaseStatisticsHelper,
  AccountBaseHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { QueneEventEmitter, Injectable, Inject } from "@bfchain/util";
import { CommonBlockVerify } from "./commonBlockVerify";
const { ArgumentIllegalException, ArgumentFormatException, ConsensusException } =
  CoreExceptionGenerator("CONTROLLER", "_blockbase");

@Injectable()
export class VerifyBlockCore<T extends Block> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;
  constructor(
    public blockHelper: BlockHelper,
    public baseHelper: BaseHelper,
    public config: ConfigHelper,
    public statisticsHelper: BlockBaseStatisticsHelper,
    public asymmetricHelper: AsymmetricHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public commonBlockVerify: CommonBlockVerify<T>,
    public accountBaseHelper: AccountBaseHelper,
    @Inject("cryptoHelper")
    public cryptoHelper: BFChainCore.CryptoHelperInterface,
  ) {}

  async verify(block: T, config = this.config) {
    this.commonBlockVerify.verifyBlockBody(block, block.remark);
    await this.verifyBlockDerivativeInfo(block, config);
    await this.commonBlockVerify.verifySignature(block);
  }

  /**
   * 校验基础信息
   *
   * @param block
   */
  async verifyBlockDerivativeInfo(block: T, config = this.config) {
    const Block_Exception_Detail = {
      target: "block",
    };

    const { baseHelper } = this;
    if (
      block.height !== 1 &&
      !block.previousBlockSignature &&
      baseHelper.isValidBlockSignature(block.previousBlockSignature)
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `previousBlockSignature ${block.previousBlockSignature}`,
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(block.numberOfTransactions)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `numberOfTransactions ${block.numberOfTransactions}`,
        type: "natural number",
        ...Block_Exception_Detail,
      });
    }

    if (!block.payloadHash) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `payloadHash ${block.payloadHash}`,
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(block.payloadLength)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `payloadLength ${block.payloadLength}`,
        type: "natural number",
        ...Block_Exception_Detail,
      });
    }

    if (block.magic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `block.magic ${block.magic}`,
        be_compare_prop: `genesisBlock.magic ${config.magic}`,
        to_target: "block_body",
        be_target: "genesis_block",
        ...Block_Exception_Detail,
      });
    }

    if (!block.generatorPublicKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "generatorPublicKey",
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isValidPublicKey(block.generatorPublicKey)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `generatorPublicKey ${block.generatorPublicKey}`,
        type: "account publicKey",
        ...Block_Exception_Detail,
      });
    }

    if (!block.signature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "signature",
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(block.signature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `signature ${block.signature}`,
        type: "signature",
        ...Block_Exception_Detail,
      });
    }

    this.commonBlockVerify.verifyBlockSize(block);

    this.commonBlockVerify.verifyBlockBlobSize(block);
  }
}

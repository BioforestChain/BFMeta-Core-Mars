import type { ImmigrateAssetTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, Inject, QueneEventEmitter, parseHexToArrayBuffer } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  ASSET_IS_ALREADY_MIGRATION,
  CAN_NOT_CARRY_SECOND_PUBLICKEY,
  CAN_NOT_CARRY_SECOND_SIGNATURE,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
} from "@bfchain/core-util-exception";
import {
  AccountBaseHelper,
  ConfigHelperMap,
  TransactionHelper,
  ConfigHelper,
  MigrateCertificateHelper,
} from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "ImmigrateAssetLogicVerifier",
);

@Injectable()
export class ImmigrateAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper)
    public accountBaseHelper: AccountBaseHelper,
    @Inject(TransactionHelper)
    public transactionHelper: TransactionHelper,
    private configMap: ConfigHelperMap,
    private migrateCertificateHelper: MigrateCertificateHelper,
  ) {
    super();
  }

  async verify(
    transaction: ImmigrateAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;

    const immigrateAsset = transaction.asset.immigrateAsset;

    const { fromChain } = immigrateAsset.body;
    const fromMagic = fromChain.magic;
    let otherChainConfig = this.configMap.get(fromMagic);
    if (!otherChainConfig) {
      const memchain = await accountGetterHelper.getChain(fromMagic);
      if (!memchain) {
        throw new ConsensusException(NOT_EXIST, {
          prop: `Chain with magic ${fromChain.magic}`,
          target: "blockChain",
          ...Function_Exception_Detail,
        });
      }
      otherChainConfig = new ConfigHelper(memchain.genesisBlock, this.configHelper.business);
      this.configMap.set(fromMagic, otherChainConfig);
    }
    await this.migrateCertificateHelper.checkChainInfo("fromChain", immigrateAsset.body.fromChain, {
      chainName: otherChainConfig.chainName,
      magic: otherChainConfig.magic,
      generatorPublicKey: otherChainConfig.generatorPublicKey,
      genesisBlockSignature: otherChainConfig.signature,
      genesisDelegates: this.transactionHelper.genesisDelegates(otherChainConfig),
    });

    const { publicKey, secondPublicKey, signSignature } = immigrateAsset.signatureJson;
    const address = await this.accountBaseHelper.getAddressFromPublicKeyString(publicKey);
    const delegate = await accountGetterHelper.getAccountInfo(address);
    if (!delegate) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Account with address ${address}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
    if (delegate.secondPublicKey) {
      if (!secondPublicKey) {
        throw new ConsensusException(PROP_IS_REQUIRE, {
          prop: `secondPublicKey`,
          target: "genesisDelegateSignature",
          ...Function_Exception_Detail,
        });
      }
      if (!signSignature) {
        throw new ConsensusException(PROP_IS_REQUIRE, {
          prop: `signSignature`,
          target: "genesisDelegateSignature",
          ...Function_Exception_Detail,
        });
      }
      if (delegate.secondPublicKey !== secondPublicKey) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `secondPublicKey ${delegate.secondPublicKey}`,
          be_compare_prop: `secondPublicKey ${secondPublicKey}`,
          to_target: "transaction",
          be_target: "delegate",
          ...Function_Exception_Detail,
        });
      }
    } else {
      if (secondPublicKey) {
        throw new ConsensusException(CAN_NOT_CARRY_SECOND_PUBLICKEY, {
          ...Function_Exception_Detail,
        });
      }
      if (signSignature) {
        throw new ConsensusException(CAN_NOT_CARRY_SECOND_SIGNATURE, {
          ...Function_Exception_Detail,
        });
      }
    }

    const { sender } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    eventLogicVerifier.listenEventAsset(cloneAccountsAssets, transaction, eventEmitter);

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 不能二次操作同一笔交易(权益迁入)
   *
   * @param transaction
   * @param currentBlockHeight
   * @param transactionGetterHelper
   */
  async checkSecondaryTransaction(
    transaction: ImmigrateAssetTransaction,
    currentBlockHeight: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const migrateCertificateId = transaction.asset.immigrateAsset.fromAuthSignatureJson.signature;
    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      type: this.transactionHelper.IMMIGRATE_ASSET,
      migrateCertificateId,
      heightRange: this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    });
    if (isSecondary) {
      throw new ConsensusException(ASSET_IS_ALREADY_MIGRATION, {
        migrateCertificateId,
        function: "checkSecondaryTransaction",
      });
    }
  }
}

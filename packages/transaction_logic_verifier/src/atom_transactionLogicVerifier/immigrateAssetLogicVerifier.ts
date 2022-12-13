import type { ImmigrateAssetTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, Inject, QueneEventEmitter, parseHexToArrayBuffer } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
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
    let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
    try {
      migrateCertificate = JSON.parse(transaction.asset.immigrateAsset.migrateCertificate);
    } catch (e) {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "migrateCertificate",
        target: "transaction.asset.immigrateAsset",
      });
    }

    const converter =
      this.migrateCertificateHelper.getMigrateCertificateConverter(migrateCertificate);

    const fromChain = converter.fromChainId.decode(migrateCertificate.body.fromChainId, true);
    const fromMagic = transaction.fromMagic;

    const memChain = await accountGetterHelper.getChain(fromMagic);
    if (!memChain) {
      throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
        prop: `Chain with magic ${fromChain.magic}`,
        target: "blockChain",
      });
    }
    const genesisBlock = memChain.genesisBlock;
    await this.migrateCertificateHelper.checkChainInfo("fromChain", fromChain, {
      chainName: genesisBlock.chainName,
      magic: genesisBlock.magic,
      generatorPublicKey: genesisBlock.genesisAccount.publicKey,
      genesisBlockSignature: genesisBlock.genesisBlockSignature,
      genesisDelegates: genesisBlock.genesisDelegates.map((item) => item.address),
    });

    const { publicKey, secondPublicKey, signSignature } = converter.toAuthSignature.decode(
      migrateCertificate.toAuthSignature,
      true,
    );
    const address = await this.accountBaseHelper.getAddressFromPublicKeyString(publicKey);
    const delegate = await accountGetterHelper.getAccountInfo(address);
    if (!delegate) {
      throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
        prop: `Account with address ${address}`,
        target: "blockChain",
      });
    }
    if (delegate.secondPublicKey) {
      if (!secondPublicKey) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: `secondPublicKey`,
          target: "genesisDelegateSignature",
        });
      }
      if (!signSignature) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: `signSignature`,
          target: "genesisDelegateSignature",
        });
      }
      if (delegate.secondPublicKey !== secondPublicKey) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `secondPublicKey ${delegate.secondPublicKey}`,
          be_compare_prop: `secondPublicKey ${secondPublicKey}`,
          to_target: "transaction",
          be_target: "delegate",
        });
      }
    } else {
      if (secondPublicKey) {
        throw new ConsensusException(ERROR_LIST.CAN_NOT_CARRY_SECOND_PUBLICKEY);
      }
      if (signSignature) {
        throw new ConsensusException(ERROR_LIST.CAN_NOT_CARRY_SECOND_SIGNATURE);
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

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventMigrateCertificate(accountGetterHelper, eventEmitter);

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  // /**
  //  * 不能二次操作同一笔交易(权益迁入)
  //  *
  //  * @param transaction
  //  * @param currentBlockHeight
  //  * @param transactionGetterHelper
  //  */
  // async checkSecondaryTransaction(
  //   transaction: ImmigrateAssetTransaction,
  //   currentBlockHeight: number,
  //   transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  // ) {
  //   let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
  //   try {
  //     migrateCertificate = JSON.parse(transaction.asset.immigrateAsset.migrateCertificate);
  //   } catch (e) {
  //     throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
  //       prop: "migrateCertificate",
  //       target: "transaction.asset.immigrateAsset",
  //     });
  //   }
  //   const converter = this.migrateCertificateHelper.getMigrateCertificateConverter(migrateCertificate);
  //   const migrateCertificateId = converter.getUUID(migrateCertificate);
  //   const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
  //     type: this.transactionHelper.IMMIGRATE_ASSET,
  //     migrateCertificateId,
  //     heightRange: this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
  //   });
  //   if (isSecondary) {
  //     throw new ConsensusException(ERROR_LIST.ASSET_IS_ALREADY_MIGRATION, {
  //       migrateCertificateId,
  //     });
  //   }
  // }
}

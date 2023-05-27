import type { ImmigrateAssetTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import {
  AccountBaseHelper,
  ConfigHelperMap,
  TransactionHelper,
  ConfigHelper,
  MigrateCertificateHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

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
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
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

    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(
        accountMap,
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}

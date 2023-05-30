import { Injectable, Inject } from "@bfchain/util";
import {
  EmigrateAssetTransaction,
  NewTransactionRefuseReason,
  PARENT_ASSET_TYPE,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  ConfigHelper,
  ConfigHelperMap,
  MigrateCertificateHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "EmigrateAssetLogicVerifier");

@Injectable()
export class EmigrateAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper)
    protected accountBaseHelper: AccountBaseHelper,
    private configMap: ConfigHelperMap,
    private migrateCertificateHelper: MigrateCertificateHelper,
  ) {
    super();
  }

  async verify(
    transaction: EmigrateAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { accountGetterHelper } = this;
    const { senderId, toMagic } = transaction;

    const account = await this.helperLogicVerifier.getAccountForce(
      accountMap,
      senderId,
      currentBlockHeight,
    );

    const { accountInfo, accountAssets } = account;
    if (accountInfo.isDelegate) {
      throw new ConsensusException(ERROR_LIST.DELEGATE_CAN_NOT_MIGRATE_ASSET);
    }

    const isVote = await accountGetterHelper.isVoteRecently(
      senderId,
      this.blockHelper.calcRoundByHeight(currentBlockHeight),
    );
    if (isVote) {
      throw new ConsensusException(ERROR_LIST.VOTE_RECENTLY);
    }

    const isFrozenAsset = await accountGetterHelper.isFrozenAsset(senderId);
    if (isFrozenAsset) {
      throw new ConsensusException(ERROR_LIST.POSSESS_FROZEN_ASSET);
    }

    await this.helperLogicVerifier.isPossessAssetExceptChainAsset(senderId, accountAssets);

    await this.helperLogicVerifier.isDAppPossessor(senderId, this.configHelper);

    await this.helperLogicVerifier.isLnsPossessorOrManager(senderId, this.configHelper);

    await this.helperLogicVerifier.isEntityFactoryPossessor(senderId, this.configHelper);

    await this.helperLogicVerifier.isEntityPossessor(senderId, this.configHelper);

    let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
    try {
      migrateCertificate = JSON.parse(transaction.asset.emigrateAsset.migrateCertificate);
    } catch (e) {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "migrateCertificate",
        target: "transaction.asset.immigrateAsset",
      });
    }

    const converter =
      this.migrateCertificateHelper.getMigrateCertificateConverter(migrateCertificate);
    const body = migrateCertificate.body;

    const asset = converter.assetId.decode(body.assetId, true);
    const fromChain = converter.fromChainId.decode(body.fromChainId, true);
    const magic = fromChain.magic;
    if (!(magic === this.configHelper.magic && asset.assetType === this.configHelper.assetType)) {
      throw new ConsensusException(ERROR_LIST.MIGRATE_MAIN_ASSET_ONLY, {
        assetType: asset.assetType,
        mainAsset: this.configHelper.assetType,
        errorId: NewTransactionRefuseReason.MIGRATE_MAIN_ASSET_ONLY,
      });
    }

    const memChain = await accountGetterHelper.getChain(toMagic);
    if (!memChain) {
      throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
        prop: `Chain with magic ${toMagic}`,
        target: "blockChain",
      });
    }
    const genesisBlock = memChain.genesisBlock;
    const toChain = converter.toChainId.decode(body.toChainId, true);
    await this.migrateCertificateHelper.checkChainInfo("toChain", toChain, {
      chainName: genesisBlock.chainName,
      magic: genesisBlock.magic,
      generatorPublicKey: genesisBlock.genesisAccount.publicKey,
      genesisBlockSignature: genesisBlock.genesisBlockSignature,
      genesisDelegates: genesisBlock.genesisDelegates.map((item) => item.address),
    });

    const { publicKey, secondPublicKey, signSignature } = converter.fromAuthSignature.decode(
      migrateCertificate.fromAuthSignature,
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
        throw new ConsensusException(ERROR_LIST.CAN_NOT_CARRY_SECOND_SIGNATURE, {
          signature: transaction.signature,
          senderId: transaction.senderId,
          applyBlockHeight: transaction.applyBlockHeight,
          type: transaction.type,
        });
      }
    }

    if (asset.parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      const totalSpend =
        asset.assetType === this.configHelper.assetType
          ? BigInt(transaction.fee) + BigInt(body.assetPrealnum)
          : BigInt(body.assetPrealnum);
      if (accountAssets[magic][asset.assetType].assetNumber !== totalSpend) {
        throw new ConsensusException(ERROR_LIST.NEED_EMIGRATE_TOTAL_ASSET, {
          address: senderId,
        });
      }
    }

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}

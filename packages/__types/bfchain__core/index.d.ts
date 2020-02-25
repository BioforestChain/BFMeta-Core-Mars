export * from "@bfchain/core-model";
export * from "@bfchain/core-helper";
export * from "@bfchain/core-account";
export * from "@bfchain/core-transaction";
export * from "@bfchain/core-transaction-logic-verifier";
export * from "@bfchain/core-block";
export * from "@bfchain/core-block-logic-verifier";
export * from "@bfchain/core-block-ticker";
export * from "@bfchain/core-transaction-subchain";
export * from "@bfchain/core-channel";
export * from "@bfchain/core-crypto";
export * from "@bfchain/core-util-exception";
export * from "@bfchain/core-util-base58";
export * from "./templateRemark";
import { TransactionCore } from "@bfchain/core-transaction";
import { TransactionLogicVerifierCore } from "@bfchain/core-transaction-logic-verifier";
import { ChannelCore } from "@bfchain/core-channel";
import { BlockCore } from "@bfchain/core-block";
import { BlockLogicVerifierCore } from "@bfchain/core-block-logic-verifier";
import { BlockTickerCore } from "@bfchain/core-block-ticker";
import { ConfigHelper, Base58Helper, AsymmetricHelper, AccountBaseHelper, TransactionHelper, BaseHelper, BlockHelper, MilestonesHelper, ConfigHelperMap, ChainAssetInfoHelper, ChainTimeHelper } from "@bfchain/core-helper";
import { ModuleStroge } from "@bfchain/util";
export declare class BFChainCore {
    config: ConfigHelper;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    ed2curveHelper: BFChainCore.Ed2curveHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    base58Helper: Base58Helper;
    asymmetricHelper: AsymmetricHelper;
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    blockHelper: BlockHelper;
    milestonesHelper: MilestonesHelper;
    baseHelper: BaseHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    configMap: ConfigHelperMap;
    block: BlockCore;
    blockLogicVerifier: BlockLogicVerifierCore;
    blockTicker: BlockTickerCore;
    transaction: TransactionCore;
    transactionLogicVerifier: TransactionLogicVerifierCore;
    channel: ChannelCore;
    time: ChainTimeHelper;
    moduleMap: ModuleStroge;
    constructor(config: ConfigHelper, cryptoHelper: BFChainCore.CryptoHelperInterface, keypairHelper: BFChainCore.KeypairHelperInterface, ed2curveHelper: BFChainCore.Ed2curveHelperInterface, Buffer: BFChainUtil.BufferConstructor, base58Helper: Base58Helper, asymmetricHelper: AsymmetricHelper, accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, blockHelper: BlockHelper, milestonesHelper: MilestonesHelper, baseHelper: BaseHelper, chainAssetInfoHelper: ChainAssetInfoHelper, configMap: ConfigHelperMap, block: BlockCore, blockLogicVerifier: BlockLogicVerifierCore, blockTicker: BlockTickerCore, transaction: TransactionCore, transactionLogicVerifier: TransactionLogicVerifierCore, channel: ChannelCore, time: ChainTimeHelper, moduleMap: ModuleStroge);
}
export declare function BFChainCoreFactory(args: {
    config: ConfigHelper;
    Buffer: BFChainUtil.BufferConstructor;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    ed2curveHelper: BFChainCore.Ed2curveHelperInterface;
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
    TIME_SPEED?: number;
}, moduleMap?: ModuleStroge, extendsions?: BFChainUtil.Constructor<any>[]): BFChainCore;
export declare enum BNID_TYPE {
    TESTNET = "c",
    MAINNET = "b"
}

import "@bfchain/core-typings";
export * from "@bfchain/core-model";
export * from "@bfchain/core-helper";

export * from "@bfchain/core-account";
export * from "@bfchain/core-transaction";
export * from "@bfchain/core-transaction-logic-verifier";
export * from "@bfchain/core-block";
export * from "@bfchain/core-block-logic-verifier";
export * from "@bfchain/core-block-ticker";
export * from "@bfchain/core-transaction-complex";

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
import {
  ConfigHelper,
  Base58Helper,
  AsymmetricHelper,
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  BlockHelper,
  MilestonesHelper,
  ConfigHelperMap,
  ChainAssetInfoHelper,
  ChainTimeHelper,
} from "@bfchain/core-helper";
import { Injectable, Inject, ModuleStroge, Resolve } from "@bfchain/util";
// export default Helper;
@Injectable()
export class BFChainCore {
  constructor(
    public config: ConfigHelper,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("keypairHelper") public keypairHelper: BFChainCore.KeypairHelperInterface,
    @Inject("ed2curveHelper") public ed2curveHelper: BFChainCore.Ed2curveHelperInterface,
    @Inject("Buffer") public Buffer: BFChainUtil.BufferConstructor,
    public base58Helper: Base58Helper, //(this.cryptoHelper, this.Buffer);
    public asymmetricHelper: AsymmetricHelper,
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public blockHelper: BlockHelper,
    public milestonesHelper: MilestonesHelper,
    public baseHelper: BaseHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public configMap: ConfigHelperMap,
    //#region 核心模块
    /**区块 */
    public block: BlockCore,
    /**区块逻辑校验器 */
    public blockLogicVerifier: BlockLogicVerifierCore,
    /**区块处理器 */
    public blockTicker: BlockTickerCore,
    /**交易 */
    public transaction: TransactionCore,
    /**校验逻辑校验器 */
    public transactionLogicVerifier: TransactionLogicVerifierCore,
    /**双工 */
    public channel: ChannelCore,
    /*时间 */
    public time: ChainTimeHelper, //#endregion
    /**所有模块的集合 */
    public moduleMap: ModuleStroge,
  ) {
    // moduleMap.set("___",(argsA)=>{
    //   return Resolve(BFChainCore,argsA)
    // })
  }
}
export function BFChainCoreFactory(
  args: {
    config: ConfigHelper;
    Buffer: BFChainUtil.BufferConstructor;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    ed2curveHelper: BFChainCore.Ed2curveHelperInterface;
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
    TIME_SPEED?: number;
  },
  moduleMap = new ModuleStroge(),
  extendsions?: BFChainUtil.Constructor<any>[],
) {
  ([
    "config",
    "Buffer",
    "cryptoHelper",
    "keypairHelper",
    "ed2curveHelper",
    "blockGetterHelper",
    "TIME_SPEED",
  ] as (keyof typeof args)[]).forEach(key => {
    moduleMap.set(key, args[key]);
  });
  let configMap: ConfigHelperMap = moduleMap.get("configMap");
  if (!configMap) {
    configMap = new ConfigHelperMap();
    moduleMap.set("configMap", configMap);
  }
  configMap.set(args.config.magic, args.config);
  /// 安装插件
  if (extendsions) {
    extendsions.forEach(plugin => {
      Resolve(plugin, moduleMap);
    });
  }
  /// 这个是因为注册链交易那边需要生产注册链的 core 包，比尿还骚
  moduleMap.set("BFChainCoreFactory", BFChainCoreFactory);
  return Resolve(BFChainCore, moduleMap);
}

/**
 * 网络标识符类型
 *
 */
export enum BNID_TYPE {
  /**测试网络 */
  TESTNET = "c",
  /**正式网络 */
  MAINNET = "b",
}

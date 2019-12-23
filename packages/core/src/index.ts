import "@bfchain/core-typings";

export * from "./block";
export * from "./index";
export * from "./blockLogicVerifier";
export * from "./blockTicker";
export * from "./transaction";
export * from "./transaction/index";
export * from "./transactionLogicVerifier";
export * from "./channel";
export * from "./channel/index";
export * from "./account";
export * from "./templateRemark";

export * from "@bfchain/core-model";
export * from "@bfchain/core-helper";

import "@bfchain/util";
import { BlockCore, TransactionCore, ChannelCore } from "./core";
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
    public accountHelper: AccountBaseHelper,
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
    /**交易 */
    public transaction: TransactionCore,
    /**双工 */
    public channel: ChannelCore,
    /*时间 */
    public time: ChainTimeHelper, //#endregion
    /**所有模块的集合 */
    public moduleMap: ModuleStroge,
  ) {}
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
  /// 这个是因为子链交易那边需要生产子链的 core 包，比尿还骚
  moduleMap.set("BFChainCoreFactory", BFChainCoreFactory);
  return Resolve(BFChainCore, moduleMap);
}

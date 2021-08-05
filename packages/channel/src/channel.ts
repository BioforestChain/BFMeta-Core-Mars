import { ChainChannel, ChainChannelGroup, CHAIN_CHANNEL_GROUP_ARGS } from "./atom_channel";
import { Injectable, ModuleStroge, Resolve } from "@bfchain/util";
import { CHANNEL_ARGS } from "@bfchain/core-model-constants";

/**实现通用的双工通讯规范 */
@Injectable()
export class ChannelCore {
  constructor(public moduleMap: ModuleStroge) {}
  /**传入事件监听器，返回封装过的双工通讯 */
  registryChannel<T extends BFChainCore.SimpleChainChannel>(
    channelEndpoint: BFChainCore.ChannelEndpointInterface,
    CustomChainChannel = ChainChannel as unknown as BFChainUtil.Constructor<T>,
    moduleMap = this.moduleMap,
    refuseTime = 1000,
  ) {
    const chainChannel = Resolve(
      CustomChainChannel,
      new ModuleStroge(
        [
          [CHANNEL_ARGS.ENDPOINT, channelEndpoint],
          [CHANNEL_ARGS.REFUSETIME, refuseTime],
        ],
        moduleMap,
      ),
    );
    return chainChannel;
  }
  private _groupNameAcc = 1;
  /**传入一组双工通讯的链接，返回一个批量双工通讯管理器 */
  groupChannel<
    DH extends BFChainCore.SimpleChainChannel = BFChainCore.SimpleChainChannel,
    GC extends BFChainUtil.Constructor<ChainChannelGroup<DH>> = BFChainUtil.Constructor<
      ChainChannelGroup<DH>
    >,
  >(
    chainChannelList: Iterable<DH>,
    groupName = `G${this._groupNameAcc++}`,
    groupChannelCtor = ChainChannelGroup as GC,
  ) {
    const { moduleMap } = this;
    const channelGroup = Resolve<InstanceType<GC>>(
      groupChannelCtor as never,
      new ModuleStroge(
        [
          [CHAIN_CHANNEL_GROUP_ARGS.CHANNEL_LIST, chainChannelList],
          [CHAIN_CHANNEL_GROUP_ARGS.GROUP_NAME, groupName],
        ],
        moduleMap,
      ),
    );
    return channelGroup;
  }
}

import { ChainChannel, ChainChannelGroup, CHAIN_CHANNEL_GROUP_ARGS } from "./atom_channel";
import { Injectable, ModuleStroge, Resolve } from "@bfchain/util";
import { CHANNEL_ARGS } from "@bfchain/core-model-constants";

/**实现通用的双工通讯规范 */
@Injectable()
export class ChannelCore {
  constructor(public moduleMap: ModuleStroge) {}
  /**传入事件监听器，返回封装过的双工通讯 */
  registryChannel<T extends ChainChannel>(
    channelEndpoint: BFChainCore.ChannelEndpointInterface,
    CustomChainChannel = ChainChannel as BFChainUtil.Constructor<T>,
    moduleMap = this.moduleMap,
  ) {
    const chainChannel = Resolve(
      CustomChainChannel,
      new ModuleStroge([[CHANNEL_ARGS.ENDPOINT, channelEndpoint]], moduleMap),
    );
    return chainChannel;
  }
  private _groupNameAcc = 1;
  /**传入一组双工通讯的链接，返回一个批量双工通讯管理器 */
  groupChannel<DH extends ChainChannel = ChainChannel>(
    chainChannelList: DH[],
    groupName = `G${this._groupNameAcc++}`,
  ) {
    const { moduleMap } = this;
    const channelGroup = Resolve<ChainChannelGroup<DH>>(
      ChainChannelGroup,
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

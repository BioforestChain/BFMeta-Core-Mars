import { ChainChannel, ChainChannelGroup } from "./atom_channel";
import { ModuleStroge } from "@bfchain/util";
/**实现通用的双工通讯规范 */
export declare class ChannelCore {
    moduleMap: ModuleStroge;
    constructor(moduleMap: ModuleStroge);
    /**传入事件监听器，返回封装过的双工通讯 */
    registryChannel<T extends ChainChannel>(channelEndpoint: BFChainCore.ChannelEndpointInterface, CustomChainChannel?: BFChainUtil.Constructor<T>, moduleMap?: ModuleStroge): T;
    private _groupNameAcc;
    /**传入一组双工通讯的链接，返回一个批量双工通讯管理器 */
    groupChannel<DH extends ChainChannel = ChainChannel>(chainChannelList: DH[], groupName?: string): ChainChannelGroup<DH>;
}
//# sourceMappingURL=channel.d.ts.map
import { ChainChannel, ChainChannelGroup } from "./atom_channel";
import { ModuleStroge } from "@bfchain/util";
export declare class ChannelCore {
    moduleMap: ModuleStroge;
    constructor(moduleMap: ModuleStroge);
    registryChannel<T extends ChainChannel>(channelEndpoint: BFChainCore.ChannelEndpointInterface, CustomChainChannel?: BFChainUtil.Constructor<T>, moduleMap?: ModuleStroge): T;
    private _groupNameAcc;
    groupChannel<DH extends BFChainCore.ChainChannel = ChainChannel>(chainChannelList: DH[], groupName?: string): ChainChannelGroup<DH>;
}

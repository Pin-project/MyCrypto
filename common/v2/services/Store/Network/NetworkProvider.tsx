import React, { useContext, createContext } from 'react';

import { Network, NetworkId, NodeType, NodeOptions, LSKeys } from 'v2/types';
import { DataContext } from '../DataManager';

export interface INetworkContext {
  networks: Network[];
  updateNetwork(id: NetworkId, item: Network): void;
  getNetworkByName(name: string): Network | undefined;
  getNetworkByChainId(chainId: number): Network | undefined;
  addNodeToNetwork(node: NodeOptions, network: Network): void;
  removeNodeTypeFromNetwork(nodeType: NodeType, network: Network): void;
  createWeb3Node(networkId: NetworkId): NodeOptions;
  createIn3Node(networkId: NetworkId): NodeOptions;
}

export const NetworkContext = createContext({} as INetworkContext);

export const NetworkProvider: React.FC = ({ children }) => {
  const { createActions, networks } = useContext(DataContext);
  const model = createActions(LSKeys.NETWORKS);

  const state: INetworkContext = {
    networks,
    updateNetwork: model.update,
    getNetworkByName: name => {
      return networks.find((network: Network) => network.name === name);
    },
    getNetworkByChainId: chainId => {
      return networks.find((network: Network) => network.chainId === chainId);
    },
    addNodeToNetwork: (node: NodeOptions, network: Network) => {
      const n = {
        ...network,
        nodes: [...network.nodes, node]
      };
      state.updateNetwork(network.id, n);
    },
    removeNodeTypeFromNetwork: (nodeType: NodeType, network: Network) => {
      const filteredNodes = network.nodes.filter(n => !(n.type === nodeType));
      const updatedNetwork = {
        ...network,
        nodes: filteredNodes
      };
      state.updateNetwork(network.id, updatedNetwork);
    },
    createWeb3Node: (networkId: NetworkId): NodeOptions => ({
      name: 'web3',
      isCustom: false,
      type: NodeType.WEB3,
      url: '',
      service: 'MetaMask / Web3',
      hidden: true,
      network: `WEB3_${networkId}`
    }),
    createIn3Node: (networkId: NetworkId): NodeOptions => ({
      name: 'in3',
      isCustom: false,
      type: NodeType.IN3,
      url: '',
      service: 'In3',
      hidden: true,
      network: `IN3_${networkId}`
    })
  };

  return <NetworkContext.Provider value={state}>{children}</NetworkContext.Provider>;
};

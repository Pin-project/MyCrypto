import { ethers } from 'ethers';
import { FallbackProvider, BaseProvider } from 'ethers/providers';
import { in3Spawn, defaultIn3Config } from 'eth-json-rpc-in3';
import { Network, NetworkId, NodeType, DPathFormat } from 'v2/types';

// Network names accepted by ethers.EtherscanProvider
type TValidEtherscanNetwork = 'homestead' | 'ropsten' | 'rinkeby' | 'kovan' | 'goerli';

const getValidEthscanNetworkId = (id: NetworkId): TValidEtherscanNetwork =>
  id === 'Ethereum' ? 'homestead' : (id.toLowerCase() as TValidEtherscanNetwork);

export const createNetworkProviders = (network: Network): FallbackProvider => {
  const { id, nodes } = network;
  const providers: BaseProvider[] = nodes.map(({ type, url }) => {
    switch (type) {
      case NodeType.ETHERSCAN: {
        const networkName = getValidEthscanNetworkId(id);
        return new ethers.providers.EtherscanProvider(networkName);
      }
      case NodeType.WEB3: {
        const ethereumProvider = window.ethereum;
        const networkName = getValidEthscanNetworkId(id);
        return new ethers.providers.Web3Provider(ethereumProvider, networkName);
      }
      case NodeType.IN3: {
        //if setting switch is turned on and netowrk is supported return provider
        const networkName = getValidEthscanNetworkId(id);
        const chainName = networkName === 'homestead' ? 'mainnet' : networkName;

        //
        //Reference for default config of In3
        //  const defaultIn3Config = {
        //    signatureCount: 2,
        //    maxAttempts: 5,
        //    proof: 'standard',
        //    keepIn3: false,
        //    replaceLatestBlock: 10
        //};
        const ethereumProvider = in3Spawn({ chainId: chainName, ...defaultIn3Config });

        return new ethers.providers.Web3Provider(ethereumProvider, networkName);
      }

      // Option to use the EthersJs InfuraProvider, but need figure out the apiAcessKey
      // https://docs.ethers.io/ethers.js/html/api-providers.html#jsonrpcprovider-inherits-from-provider
      // case NodeType.INFURA:
      //   return new ethers.providers.InfuraProvider(name);

      // default case covers the remaining NodeTypes.
      default:
        return new ethers.providers.JsonRpcProvider(url);
    }
  });

  return new ethers.providers.FallbackProvider(providers);
};

export const getDPath = (network: Network | undefined, type: DPathFormat): DPath | undefined => {
  return network ? network.dPaths[type] : undefined;
};

export const getDPaths = (networks: Network[], type: DPathFormat): DPath[] => {
  return networks
    .map((n: Network) => getDPath(n, type))
    .filter((d: DPath | undefined) => d !== undefined) as DPath[];
};

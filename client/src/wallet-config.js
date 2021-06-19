// todo: get contract name from environment variable
function getConfig(env) {
    switch (env) {
        // todo: use mainnet on production as well
        case 'production':
        case 'mainnet':
            return {
                networkId: 'mainnet',
                nodeUrl: 'https://rpc.mainnet.near.org',
                contractName:  'pluminite.near',
                walletUrl: 'https://wallet.near.org',
                helperUrl: 'https://helper.mainnet.near.org',
                explorerUrl: 'https://explorer.mainnet.near.org',
                appTitle: "NEAR Escrow"
            };
        case 'development':
        case 'testnet':
            return {
                networkId: 'testnet',
                nodeUrl: 'https://rpc.testnet.near.org',
                contractName: "dev-1623768914575-33899406557455",
                walletUrl: 'https://wallet.testnet.near.org',
                helperUrl: 'https://helper.testnet.near.org',
                explorerUrl: 'https://explorer.testnet.near.org',
                appTitle: "NEAR Escrow Testnet"
            };

        case 'test':
        case 'ci':
            return {
                networkId: 'shared-test',
                nodeUrl: 'https://rpc.ci-testnet.near.org',
                contractName: "",
                masterAccount: 'test.near',
            };
        case 'ci-betanet':
            return {
                networkId: 'shared-test-staging',
                nodeUrl: 'https://rpc.ci-betanet.near.org',
                contractName: "",
                masterAccount: 'test.near',
            };
        default:
            throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
    }
}

module.exports = getConfig;

import {connect, Contract, keyStores, WalletConnection, providers, Connection, default as nearAPI} from 'near-api-js'
import BN from 'bn.js'
//import getConfig from './wallet-config'


//const nearConfig = getConfig(process.env.NODE_ENV || 'development')


const IsMainnet = window.location.hostname === 'near.bet'
const TestNearConfig = {
    accountSuffix: 'testnet',
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    //contractName: 'dev-1616355537428-9726228',
    contractName:  "dev-1623768914575-33899406557455",
    walletUrl: 'https://wallet.testnet.near.org',
    marketPublicKey: 'ed25519:EgmA4v9E2SjFVu31bmJKJtNW6cjkx2cbM3HyXprsYvrA',
    wasmCode: 'https://near.bet/bin',
    claimPeriod: 15 * 60
}
const MainNearConfig = {
    accountSuffix: 'near',
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    contractName: 'c.nearbet.near',
    walletUrl: 'https://wallet.near.org',
    marketPublicKey: 'ed25519:5mgNVstFy67S469tG2j8MjRchPuKqJFYsydghKRteR42',
    wasmCode: 'https://near.bet/bin',
    claimPeriod: 72 * 60 * 60
}
const NearConfig = IsMainnet ? MainNearConfig : TestNearConfig;

// Initialize contract & set global variables
export async function initContract() {
    /*
    // Initialize connection to the NEAR testnet
    const near = await connect(Object.assign({deps: {keyStore: new keyStores.BrowserLocalStorageKeyStore()}}, nearConfig))

    // Initializing Wallet based Account. It can work with NEAR testnet wallet that
    // is hosted at https://wallet.testnet.near.org

    window.walletConnection = new WalletConnection(near);
    window.near = near;

    const provider = new providers.JsonRpcProvider(nearConfig.nodeUrl);
    window.connection = new Connection(nearConfig.nodeUrl, provider, {});

    // Getting the Account ID. If still unauthorized, it's just empty string
    window.accountId = window.walletConnection.getAccountId()

    // Initializing our contract APIs by contract name and configuration
    window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
        // View methods are read only. They don't modify the state, but usually return some value.
        viewMethods: ['get_top_proposals', 'get_proposal', 'get_proposals',
            'get_request_key', 'get_contacts', 'get_owners', 'storage_paid', 'has_request_key', 'get_request', 'get_all_contacts'],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ['place', 'accept', 'acquire', 'accept_and_acquire',
            'start_auth', 'sign_auth', 'remove_request', 'send', 'storage_deposit', 'storage_withdraw', 'confirm_auth', 'remove'],
    })*/



    window._near = {}
    window._near.lsKey = NearConfig.contractName + ':v01:'
    window._near.lsOfferAccountId = window._near.lsKey + 'offerAccountId'
    window._near.lsFavorAccountId = window._near.lsKey + 'favorAccountId'
    window._near.lsPrevKeys = window._near.lsKey + 'prevKeys'

    window._near.config = NearConfig
    window._near.marketPublicKey = NearConfig.marketPublicKey
    window._near.accountSuffix = NearConfig.accountSuffix
    window._near.claimPeriod = NearConfig.claimPeriod

    const provider = new providers.JsonRpcProvider(NearConfig.nodeUrl);
    window._near.connection = new Connection(NearConfig.nodeUrl, provider, {});

    _initNear().then(() => {
        console.log("connect here")
        console.log(window._near.accountId)
    })
}
async function _initNear() {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore()
    console.log("keyStore")
    console.log(keyStore)
    const near = await connect(Object.assign({deps: {keyStore}}, NearConfig))
    console.log("near")
    console.log(near)

    //this._near.keyStore = keyStore
    window._near.keyStore = keyStore
    window._near.near = near

    //this._near.near = window.near;


    window._near.walletConnection = new WalletConnection(near, NearConfig.contractName)
    console.log("walletConnection")
    console.log(window._near.walletConnection)
    window._near.accountId = window._near.walletConnection.getAccountId()
    console.log("accountId")
    console.log(window._near.accountId)

/*
    this._near.walletConnection = window.walletConnection;
    this._near.accountId = window.accountId;
*/

    window._near.account = window._near.walletConnection.account()

    let escrowContract = await new Contract(window._near.walletConnection.account(), NearConfig.contractName, {
        // View methods are read only. They don't modify the state, but usually return some value.
        viewMethods: ['get_top_proposals', 'get_proposal', 'get_proposals',
            'get_request_key', 'get_contacts', 'get_owners', 'storage_paid', 'has_request_key', 'get_request', 'get_all_contacts'],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ['place', 'accept', 'acquire', 'accept_and_acquire',
            'start_auth', 'sign_auth', 'remove_request', 'send', 'storage_deposit', 'storage_withdraw', 'confirm_auth', 'remove'],
    })

    window._near.contract = escrowContract;
};


export function logout() {
    window._near.walletConnection.signOut()
    // reload page
    window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
    // Allow the current app to make calls to the specified contract on the
    // user's behalf.
    // This works by creating a new access key for the user's account and storing
    // the private key in localStorage.
    window._near.walletConnection.requestSignIn(NearConfig.contractName, NearConfig.appTitle)
    //window.walletConnection.requestSignIn()
}


export function convertToYoctoNear(amount) {
    return new BN(Math.round(amount * 100000000)).mul(new BN("10000000000000000")).toString();
}

export function toParams(query) {
    const q = query.replace(/^\??\//, '');

    return q.split('&').reduce((values, param) => {
        const [key, value] = param.split('=');

        values[key] = value;

        return values;
    }, {});
}

export function toQuery(params, delimiter = '&') {
    const keys = Object.keys(params);

    return keys.reduce((str, key, index) => {
        let query = `${str}${key}=${params[key]}`;

        if (index < (keys.length - 1)) {
            query += delimiter;
        }

        return query;
    }, '');
}

import {Component} from 'react';
import {Form, Button, Col, Spinner, Alert} from 'react-bootstrap';
import {createProduct} from '../services/productData';
import SimpleSider from '../components/Siders/SimpleSider';
import '../components/CreateSell/CreateSell.css';
import {convertToYoctoNear, logout} from "../utils";
import * as nearAPI from 'near-api-js'
import {PublicKey} from 'near-api-js/lib/utils'
import {KeyType} from 'near-api-js/lib/utils/key_pair'
import {Row, Tabs, Tab, Image, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {BsFillInfoCircleFill} from 'react-icons/bs';
import getConfig from './../wallet-config'
import queryString from 'query-string';

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

const GAS = '200000000000000';

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

class AddProduct extends Component {

    constructor(props) {
        super(props);
        this.state = {
            proposal_id: "",
            price: "1",
            profile_id: "zavodil.testnet",
            description: "",
            loading: false,
            alertShow: false,
            accountIdErrorMessage: "",
            descriptionErrorMessage: "",
            errors: [],
            connected: false,
            account: null
        };
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.onSubmitHandler = this.onSubmitHandler.bind(this);

        let params = queryString.parse(this.props.location.search);
        if (params && params.price && params.favor && params.account_id && params.account_id === window._near.accountId) { // return after full access key set
            this.setState({
                price: params.price,
                profile_id: params.favor,
                description: params.description
            })

            // TO DO SET fields
            console.log("offer...")
            console.log(window._near.accountId)

            let obj = {price: params.price, profile_id: params.favor, description: params.description}
            this.submitOffer(obj).then(e => console.log(e));
        }

    }

    onChangeHandler(e) {
        e.preventDefault();
        this.setState({[e.target.name]: e.target.value});
        if (e.target.files) {
            this.setState({image: e.target.files[0]})
        }
    };

    async submitOffer(obj) {
        if(!obj)
            return;

        console.log("window._near.accountId")
        console.log(window._near.accountId)
        if (window._near.accountId) {
            const accessKeys = await window._near.account.getAccessKeys()

            console.log(accessKeys)

            let foundMarketKey = false
            accessKeys.forEach(key => {
                if (key.public_key === window._near.marketPublicKey) {
                    foundMarketKey = true
                }
            })

            console.log("foundMarketKey " + foundMarketKey)

            const offerAccountId = window._near.accountId;
            const favorAccountId = obj.profile_id;

            if (!foundMarketKey) {
                try {
                    const account = await window._near.near.account(window._near.accountId)
                    let addKeyTx = await account.addKey(window._near.marketPublicKey, undefined, undefined, 0)
                        .then(async e => {
                            return true;
                        })
                        .catch(e => {
                            console.log(e);
                            this.setState({
                                loading: false,
                                alertShow: true,
                                "errors": ["Full access key is missing. Relogin..."]
                            });
                            return false;
                        });

                    console.log("addKeyTx")
                    console.log(addKeyTx)


                    if (!addKeyTx) {
                        await window._near.walletConnection.signOut()
                        let y = await window._near.walletConnection.requestSignIn(
                            window._near.accountId, //'',
                            nearConfig.appTitle,
                            window.location.origin + `/add-offer?account_id=${offerAccountId}&price=${obj.price}&favor=${favorAccountId}&description=${obj.description}`,
                            window.location.origin + '/add-offer'
                        );
                        console.log("login");
                        console.log(y)
                        return;
                    }


                    // === We have full access key at the point ===
                    if (window._near.accountId !== offerAccountId) {
                        // Wrong account
                        await account.deleteKey(window._near.marketPublicKey)
                        console.log('wrong account')
                        this.setState({offerFinished: true, offerSuccess: false})
                    } else {
                        // NO WAY
                        // const lastKey = this._near.walletConnection._authData.allKeys[0]
                        // const lastKey = this._near.walletConnection._connectedAccount.connection.signer.keyStore.localStorage['near-api-js:keystore:' + this._near.accountId + ':' + NearConfig.networkId]
                        const lastKey = (await window._near.walletConnection._keyStore.getKey(NearConfig.networkId, window._near.accountId)).getPublicKey().toString()

                        console.log('all keys', accessKeys)
                        console.log('all local keys', window._near.walletConnection._authData.allKeys)
                        console.log('last key', lastKey)

                        for (let index = 0; index < accessKeys.length; index++) {
                            if (lastKey !== accessKeys[index].public_key) {
                                console.log('deleting ', accessKeys[index])
                                await account.deleteKey(accessKeys[index].public_key)
                                console.log('deleting ', accessKeys[index], 'done')
                            }
                        }

                        //const offerResult = await this._near.contract.offer({profile_id: favorAccountId}, '200000000000000', String(parseInt(0.3 * 1e9)) + '000000000000000')
                        const offerResult = await window._near.contract.place({
                                profile_id: obj.profile_id,
                                price: obj.price,
                                description: obj.description
                            },
                            GAS,
                            convertToYoctoNear(Number(obj.price) / 100 + 1)
                        );
                        console.log('offer result', offerResult)

                        const state = await account.state()
                        console.log(state)

                        const data = await fetch(NearConfig.wasmCode)
                        console.log('!', data)
                        const buf = await data.arrayBuffer()

                        await account.deployContract(new Uint8Array(buf))

                        const contract = await new nearAPI.Contract(account, window._near.accountId, {
                            viewMethods: [],
                            changeMethods: ['lock'],
                            sender: window._near.accountId
                        })
                        console.log('Deploying done. Initializing contract...')
                        console.log(await contract.lock(Buffer.from('{"owner_id":"' + NearConfig.contractName + '"}')))
                        console.log('Init is done.')

                        console.log('code hash', (await account.state()).code_hash)

                        console.log('deleting marketplace key', window._near.marketPublicKey)
                        await account.deleteKey(window._near.marketPublicKey)
                        console.log('deleting ', window._near.marketPublicKey, 'done')

                        console.log('deleting last key', lastKey)
                        await account.deleteKey(lastKey)
                        console.log('deleting ', lastKey, 'done')

                        this.setState({offerFinished: true, offerSuccess: true})
                    }
                    logout()


                } catch (e) {
                    console.log("F")
                    this.setState({offerFinished: true, offerSuccess: false})
                    console.log('Error', e)
                }
            }
            else{
                this.setState({
                    loading: false,
                    alertShow: true,
                    "errors": ["Market key already added"]
                });
            }
        }

        console.log(this.state);


        return;

        return await window._near.contract.place({
                profile_id: obj.profile_id,
                price: obj.price,
                description: obj.description
            },
            GAS,
            convertToYoctoNear(Number(obj.price) / 100 + 1)
        );
    };

    async accountExists(accountId) {
        if (accountId.length === 44) {
            let key = new PublicKey({keyType: KeyType.ED25519, data: Buffer.from(accountId, 'hex')});
            return !!(key.toString())
        }

        console.log("accountId")
        console.log(accountId)
        console.log("walletConnection")
        console.log(window._near.walletConnection)
        try {
            let a = await new nearAPI.Account(window._near.connection, accountId);
            console.log(a)
            await a.state();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async onSubmitHandler(e) {
        e.preventDefault();
        let {price, profile_id, description} = this.state;

        console.log(Number(price) / 100 + 1);
        console.log(convertToYoctoNear(Number(price) / 100 + 1));

        console.log(this.state);

        if (!price || !profile_id) {
            console.error('Wrong data');
            return false;
        }

        this.setState({loading: true});

        if (description.length >= 200) {
            this.setState({descriptionErrorMessage: "Description is longer then 200 chars", loading: false});
            return false;

        }

        if (profile_id === window._near.accountId) {
            this.setState({
                accountIdErrorMessage: "Account to sale and account to receive the payment should be different",
                loading: false
            });
            return false;
        }

        const valid = await this.accountExists(profile_id);
        if (!valid) {
            this.setState({accountIdErrorMessage: "Provided account id is invalid", loading: false});
            return false;
        }


        let obj = {price, profile_id, description}

        this.submitOffer(obj)
            .then(res => {
                console.log(res)
            })
            .catch(err => console.error('Creating offer err: ', err));
    }

    render() {
        return (
            <>
                <SimpleSider/>
                <div className='container'>
                    <h1 className="heading">Offer an account</h1>
                    <Form onSubmit={async event => this.onSubmitHandler(event)}>
                        {this.state.alertShow &&
                        <Alert variant="danger" onClose={() => this.setState({alertShow: false})} dismissible>
                            <p>
                                {this.state.errors}
                            </p>
                        </Alert>
                        }
                        <Form.Row>
                            <Form.Group as={Col} controlId="formGridTitle">
                                <Form.Label>Account to transfer on escrow</Form.Label>

                                <OverlayTrigger placement="top"
                                                overlay={<Tooltip>You will loose access to this account as soon as
                                                    acquire process will be finalized</Tooltip>}>
                                    <BsFillInfoCircleFill style={{marginLeft: "5px"}}/>
                                </OverlayTrigger>

                                <Form.Control type="text" name="proposal_id" required readOnly
                                              value={window._near.accountId}/>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridPrice">
                                <Form.Label>Price (NEAR)</Form.Label>
                                <Form.Control type="number" step="0.01" placeholder="Price" name="price" required
                                              onChange={this.onChangeHandler}
                                              defaultValue="1"
                                />
                            </Form.Group>
                        </Form.Row>


                        <Form.Row>
                            <Form.Group as={Col} controlId="profile_id">
                                <Form.Label>Account to receive the payment</Form.Label>

                                <OverlayTrigger placement="top"
                                                overlay={<Tooltip>You will sell {window._near.accountId} and receive the
                                                    reward to this account</Tooltip>}>
                                    <BsFillInfoCircleFill style={{marginLeft: "5px"}}/>
                                </OverlayTrigger>

                                <Tooltip>You will sell {window._near.accountId} and receive the reward to this
                                    account</Tooltip>

                                <Form.Control name="profile_id" required onChange={this.onChangeHandler}
                                              isInvalid={!!this.state.accountIdErrorMessage}
                                              defaultValue="zavodil.testnet"
                                />

                                <Form.Control.Feedback type="invalid">
                                    {this.state.accountIdErrorMessage}
                                </Form.Control.Feedback>
                            </Form.Group>


                            <Form.Group as={Col} controlId="profile_id">
                                <Form.Label>Description (optional)</Form.Label>

                                <OverlayTrigger placement="top"
                                                overlay={<Tooltip>Additional information about this offer for all
                                                    marketplace users</Tooltip>}>
                                    <BsFillInfoCircleFill style={{marginLeft: "5px"}}/>
                                </OverlayTrigger>

                                <Form.Control name="description" onChange={this.onChangeHandler}
                                              isInvalid={!!this.state.descriptionErrorMessage}
                                              defaultValue="Test"
                                />

                                <Form.Control.Feedback type="invalid">
                                    {this.state.descriptionErrorMessage}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form.Row>
                        {this.state.loading ?
                            <Button className="col-lg-12" variant="dark" disabled>
                                Please wait... <Spinner animation="border"/>
                            </Button>
                            :
                            <Button className="col-lg-12" variant="dark" type="submit">Process</Button>
                        }
                    </Form>
                </div>
            </>
        )
    }
}

export default AddProduct;
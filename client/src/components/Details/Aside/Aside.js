import {useState} from 'react';
import {Button, Modal, Form, OverlayTrigger, Tooltip, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {RiShoppingCartFill} from 'react-icons/ri';
import {GrEdit} from 'react-icons/gr';
import {MdArchive} from 'react-icons/md'
import {BsFillPersonFill} from 'react-icons/bs';
import {MdEmail, MdPhoneAndroid} from 'react-icons/md'
import {FaSellsy} from 'react-icons/fa'
import {archiveSell} from '../../../services/productData'
import {convertToYoctoNear, login, logout} from './../../../utils'
import './Aside.css';
import {generateSeedPhrase, parseSeedPhrase} from 'near-seed-phrase'
import useSWR from 'swr'
import { Contract } from 'near-api-js'
import { useParams } from 'react-router'

const GAS = '200000000000000';


function Aside({params, history}) {
    const [showMsg, setShowMdg] = useState(false);
    const [showArchive, setShowArchive] = useState(false);

    const [seedPhrase, setSeedPhrase] = useState(generateSeedPhrase().seedPhrase)

    const handleClose = () => setShowMdg(false);
    const handleShow = () => setShowMdg(true);

    const handleCloseArchive = () => setShowArchive(false);
    const handleShowArchive = () => setShowArchive(true);

    //const { bidId } = useParams()
    const bidId = params.proposal_id;


    const mapBidInfo = (b) => {
        console.log("mapBidInfo")
        console.log(b)
        return b ? {
            isAtMarket: true,
            numClaims: b.num_claims,
            claimedBy: b.claim_status ? b.claim_status[0] : null,
            claimedTime: b.claim_status ? b.claim_status[1] : null,
            bets: b.bets,
            betPrice: b.bet_price,
            claimPrice: b.claim_price,
            forfeit: b.forfeit,
            isOnAcquisition: b.on_acquisition
        } : {
            isAtMarket: false,
            numClaims: 0,
            claimedBy: null,
            claimedTime: null,
            bets: null,
            betPrice: 0,
            claimPrice: 0,
            forfeit: null,
            isOnAcquisition: false
        }
    }

    const fetchBid = async (...args) => {
        return await window._near.contract.get_proposal({
            proposal_id: args[1]
        })
    }

    const fetchBidSafety = async (...args) => {
        const bidId = args[1]
        console.log("bidId " + bidId)
        const account = await window._near.near.account(bidId)
        console.log("account fetchBidSafety");
        console.log(account);
        try {
            console.log("codeHash");
            let s = await account.state();
            console.log("s")
            console.log(s)
            const codeHash = (await account.state()).code_hash
            console.log(codeHash);
            const accessKeysLen = (await account.getAccessKeys()).length
            const lockerContract = await new Contract(account, bidId, {
                viewMethods: ['get_owner'],
                changeMethods: []
            })
            const lockerOwner = await lockerContract.get_owner({})
            const balance = (await account.getAccountBalance()).total
            return { codeHash, accessKeysLen, lockerOwner, balance }
        } catch (e) {
            console.log('check safety error', e)
        }
        return { codeHash: '(unknown)', accessKeysLen: '(unknown)', lockerOwner: '(not found)', balance: 0 }
    }

    const { data: bidInfo } = useSWR(['bid_id', bidId], fetchBid, { errorRetryInterval: 250 })
    const { data: bidSafety } = useSWR(['bid_id_safety', bidId], fetchBidSafety, { errorRetryInterval: 250 })

    const isReady = !!bidInfo && !!bidSafety

    const proposal_safe = bidInfo && !(bidInfo.is_deposit_received  || bidInfo.is_expired || !!(bidInfo.new_owner));

    const isSafe = isReady &&
        (proposal_safe ||
            (bidSafety.codeHash === 'DKUq738xnns9pKjpv9GifM68UoFSmfnBYNp3hsfkkUFev-1623768914575-338994065574a' &&
                bidSafety.accessKeysLen === 0 &&
                bidSafety.lockerOwner === window._near.config.contractName))

    console.log("bidSafety")
    console.log(bidSafety)

    console.log("bidInfo")
    console.log(bidInfo)



    const handleAccept = async () => {
        /*

  const fetchBidSafety = async (...args) => {
    const bidId = args[1]
    const account = await props._near.near.account(bidId)
    try {
      const codeHash = (await account.state()).code_hash
      const accessKeysLen = (await account.getAccessKeys()).length
      const lockerContract = await new Contract(account, bidId, {
        viewMethods: ['get_owner'],
        changeMethods: []
      })
      const lockerOwner = await lockerContract.get_owner({})
      const balance = (await account.getAccountBalance()).total
      return { codeHash, accessKeysLen, lockerOwner, balance }
    } catch (e) {
      console.log('check safety error', e)
    }
    return { codeHash: '(unknown)', accessKeysLen: '(unknown)', lockerOwner: '(not found)', balance: 0 }
  }

  const { data: bidInfo } = useSWR(['bid_id', bidId], fetchBid, { errorRetryInterval: 250 })
  const { data: bidSafety } = useSWR(['bid_id_safety', bidId], fetchBidSafety, { errorRetryInterval: 250 })

  const isReady = !!bidInfo && !!bidSafety

  const isSafe = isReady &&
  (!bidInfo.isAtMarket ||
  (bidSafety.codeHash === 'DKUq738xnns9pKjpv9GifM68UoFSmfnBYNp3hsfkkUFa' &&
  bidSafety.accessKeysLen === 0 &&
  bidSafety.lockerOwner === props._near.config.contractName))
         */
        return await window._near.contract.accept({
                proposal_id: params.proposal_id
            },
            GAS,
            convertToYoctoNear(Number(params.price))
        );

        console.log(params)
    }

    const handleAcquire = async (e) => {

        if(!isSafe) {
            alert("!isSafe")
            return;
        }


        console.log("isSafe")
        console.log(isSafe)

        console.log(seedPhrase)
        const publicKey = parseSeedPhrase(seedPhrase, '').publicKey
        console.log(publicKey)

        await window._near.contract.accept_and_acquire({
                proposal_id: params.proposal_id,
                new_public_key: publicKey
            },
            GAS,
            convertToYoctoNear(Number(params.price))
        );

        console.log(params)
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        archiveSell(params._id)
            .then(res => {
                setShowArchive(false);
                history.push('/profile')
            })
    }

    const handleChanges = (e) => {
        setSeedPhrase(e.target.value);
    }

    // console.log(params)
    return (
        <aside>
            <div className="product-details-seller">
                <div id="priceLabel" className="col-lg-12">
                    <h4 id="product-price-heading">Price </h4>
                    {params.isSeller &&
                    <>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Edit the selling</Tooltip>}>
                                <span id="edit-icon">
                                    <Link to={`/categories/${params.category}/${params._id}/edit`}><GrEdit/></Link>
                                </span>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Archive</Tooltip>}>
                                <span id="archive-icon" onClick={handleShowArchive}>
                                    <MdArchive/>
                                </span>
                        </OverlayTrigger>

                    </>
                    }
                    <h1 id="price-heading">{params.price} Ⓝ</h1>
                </div>
                {window.accountId ? (<>
                    <Button variant="dark" className="col-lg-10" id="btnContact" onClick={handleShow}>
                        <RiShoppingCartFill/>Acquire account
                    </Button>
                </>) : (
                    <p id="guest-msg"><Button onClick={login}>Sign In</Button> now to make a bid!</p>
                )}
            </div>
            <Modal show={showMsg} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Your Seed Phrase</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>Save this randomly generated seed phrase or choose your own</div>
                    <Form>
                        <Form.Group>
                            <Form.Control as="textarea" rows={3}
                                          placeholder='Example: van honey cattle trend garbage human cereal donor pipe you response gym '
                                          defaultValue={seedPhrase}
                                          name="seedPhrase"
                                          onChange={handleChanges}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>

                    <Button variant="dark" onClick={handleAcquire}>Acquire</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showArchive} onHide={handleCloseArchive}>
                <Modal.Header closeButton>
                    <Modal.Title>Are you sure you want to archive this item?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        By clicking <strong>Archive</strong>, this sell will change
                        it's status to <strong>Archived</strong>,
                        which means that no one but you will be able see it.
                        You may want to change the status to <strong>Actived</strong> if you have
                        sold the item or you don't want to sell it anymore.
                    </p>

                    Don't worry, you can unarchive it at any time from Profile - Sells!
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseArchive}>
                        Close
                    </Button>
                    <Button variant="success" onClick={handleSubmit}>
                        Archive
                    </Button>
                </Modal.Footer>
            </Modal>
        </aside>
    )
}

export default Aside;
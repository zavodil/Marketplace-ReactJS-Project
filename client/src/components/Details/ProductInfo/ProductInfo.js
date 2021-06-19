import {useState, useEffect} from 'react';
import {Row, Tabs, Tab, Image, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {BsHeart, BsHeartFill} from 'react-icons/bs';
import {wishProduct} from '../../../services/productData'

function ProductInfo({params}) {
    const [wish, setWish] = useState(false);

    useEffect(() => {
        if (params.isWished == true) {
            setWish(true)
        } else {
            setWish(false)
        }
    }, [params.isWished, setWish])

    const onHearthClick = () => {
        if (wish == false) {
            wishProduct(params._id)
                .then(res => {
                    setWish(true);
                })
        } else {
            wishProduct(params._id)
                .then(res => {
                    setWish(false);
                })
        }
    }



    return (
        <>
            {/* <Image className="col-lg-12" src={params.image} rounded /> */}
            <Row>
                <div className="product-info-heading col-lg-10 col-sm-10">
                    <h3>
                        Account for sale: {params.proposal_id}
                    </h3>

                    {params.new_owner ?
                        <span>
                        New owner: {params.new_owner}
                    </span> : null
                    }
                </div>
                <span id="heartIconDetails" className="col-lg-1 col-sm-1" onClick={onHearthClick}>
                {params.isAuth && <>
                    {!wish ? (
                            <OverlayTrigger placement="top" overlay={<Tooltip>Add to Wishlist</Tooltip>}>
                                <BsHeart/>
                            </OverlayTrigger>
                        )
                        : (
                            <OverlayTrigger placement="top" overlay={<Tooltip>Remove from Wishlist</Tooltip>}>
                                <BsHeartFill/>
                            </OverlayTrigger>
                        )
                    }
                </>}

                </span>
            </Row>
            <div id="detailsCardText" className="col-lg-12">
                <Tabs defaultActiveKey="details" transition={false}>
                    <Tab eventKey="details" title="Details" id="tab-details">

                        <p><strong>Proposal owner: </strong>{params.proposal_owner}</p>

                        {params.description ? <p><strong>Description: </strong>{params.description}</p> : null}
                        <p>Expired: {params.is_expired ? "True" : "False"}</p>
                        <p>Deposit Received: {params.is_deposit_received ? "True" : "False"}</p>
                        <hr/>
                        <p id="details-footer" className="text-muted">Proposal listed at {params.publish_date}</p>
                    </Tab>
                    {/* <Tab eventKey="aboutSeller" title="About seller">
                        <p>Name: {params.name || "Not specified"}</p>
                        <p>Email: {params.email}</p>
                        <p>Telephone: {params.phone}</p>
                        <p>City: {params.city}</p>
                    </Tab> */}
                </Tabs>
            </div>
        </>
    )
}

export default ProductInfo;
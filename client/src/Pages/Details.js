import { useEffect, useState } from 'react';
import { Col, Row, Spinner } from 'react-bootstrap';
import SimpleSider from '../components/Siders/SimpleSider';
import Breadcrumb from '../components/Details/Breadcrumb'
import ProductInfo from '../components/Details/ProductInfo/ProductInfo';
import Aside from '../components/Details/Aside/Aside';
import { getSpecific } from '../services/productData'

import '../components/Details/ProductInfo/ProductInfo.css';
import '../components/Details/Aside/Aside.css';

function Details({ match, history }) {
    let productId = match.params.id;
    let [product, setProduct] = useState([])
    let [loading, setLoading] = useState(true);


    async function getProposal(id) {
        const proposal = await window._near.contract.get_proposal({
            proposal_id: id
        });
        proposal.publish_date = new Intl.DateTimeFormat('default', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(Number(proposal.published_time)/ 1000000));
        proposal.proposal_id = id;
        return proposal;
    }


   
    useEffect(() => {
        getProposal(productId)
            .then(res => setProduct(res), setLoading(false))
            .catch(err => console.log(err))
    }, [productId, setProduct, setLoading])

    return (
        <>
            <SimpleSider />
            <div className="container">
                {!loading ? (
                    <>
                    <Breadcrumb params={product} />
                    <Row>
                        <Col lg={8} id="detailsProduct">
                            <ProductInfo params={product} />
                        </Col>
                        <Col lg={4}>
                            <Aside params={product} history={history} />
                        </Col>
                    </Row></>) : (<Spinner animation="border" />)}
            </div>
        </>
    )
}

export default Details;
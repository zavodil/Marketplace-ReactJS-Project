import { useEffect, useState } from 'react';
import SearchSider from '../components/Siders/SearchSider'
import CategoriesNav from '../components/Categories/CategoriesNav'
import ProductCard from '../components/ProductCard/ProductCard';
import { Col } from 'react-bootstrap';
import { getAll } from '../services/productData';

import '../components/Categories/Categories.css';
import '../components/ProductCard/ProductCard.css';

function Categories({ match }) {
    let currentCategory = match.params.category;
    const [proposals, setProposals] = useState([])

    useEffect(() => {
        getAll(currentCategory)
            .then(data => {
                let proposalKeys = Object.keys(data);
                let proposals = [];
                proposalKeys.map(proposal_id => {
                    let proposal = data[proposal_id];
                    proposal.proposal_id = proposal_id;
                    proposals.push(proposal);
                });
                setProposals(proposals)
            });
    }, [currentCategory])

    console.log(proposals)
    return (
        <>
            <SearchSider />
            { /* <CategoriesNav /> */ }

            <div className="container" style={{padding: "20px 0"}}>
                <h3>Current offers</h3>
            </div>

            <div className="container" >
                <div className="row">
                    {proposals
                        .map(x =>
                            <Col xs={12} md={6} lg={3} key={x.proposal_id}>
                                {<ProductCard params={x} />}
                            </Col>
                        )}
                </div>
            </div>
        </>
    )
}

export default Categories;
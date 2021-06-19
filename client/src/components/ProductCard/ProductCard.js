import {Card} from 'react-bootstrap';
// import { BsHeart, BsHeartFill } from 'react-icons/bs';
import {Link} from 'react-router-dom';

function ProductCard({params}) {
    console.log(params)
    return (
        <Card>
            <Link to={`/proposals/${params.proposal_id}/details`}>
                {/* <Card.Img variant="top" src={params.image} /> */}
                <Card.Body>
                    <Card.Title>{params.proposal_id}</Card.Title>
                    <Card.Text>{params.price} Ⓝ</Card.Text>
                </Card.Body>
            </Link>
            <Card.Footer>
                <small className="text-muted">
                    <div>{params.description}</div>
                    {/* {params.addedAt} - <strong>{params.city}</strong>
                    {<Link to="" id="heartIcon"><BsHeart /></Link>}
                    */}
                </small>
            </Card.Footer>
        </Card>
    )
}

export default ProductCard;
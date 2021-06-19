import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function BreadcrumbNav({ params }) {
    console.log(params);
    return (
        <Breadcrumb>
            <li className="breadcrumb-item">
                <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
                <Link to={`/proposals/${params.proposal_id}`}>{params.proposal_id}</Link>
            </li>
            <li  className="breadcrumb-item">
                <Link to={`/proposals/${params.proposal_id}/${params.proposal_id}/details`}>{params.title}</Link>
            </li>
        </Breadcrumb>
    )
}

export default BreadcrumbNav;
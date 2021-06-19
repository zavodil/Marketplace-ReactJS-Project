import {useContext} from 'react';
import {Context} from '../../ContextStore';
import {Navbar, NavDropdown, Nav, Card, CardDeck, Image, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import {
    BsFillPersonFill,
    BsFillGridFill,
    BsFillHeartFill,
    BsFillEnvelopeFill,
    BsFillPlusCircleFill
} from 'react-icons/bs';
import {IoLogOut} from 'react-icons/io5'
import {FaUserCircle} from 'react-icons/fa'
import {login, logout} from './../../utils'

import './Header.css'

function Header() {
    const {userData, setUserData} = useContext(Context)

    return (
        <Navbar collapseOnSelect bg="light" variant="light" style={{textAlign: "right"}}>
            <div className="container">
                <Navbar.Brand>
                    <NavLink className="navbar-brand" to="/">NEAR Account Escrow</NavLink>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto">
                        {/* <Nav.Link href="#features">Features</Nav.Link>
                        <Nav.Link href="#pricing">Pricing</Nav.Link> */}
                    </Nav>
                    {window._near.accountId ?
                        (
                            <>
                                <NavLink to={"/add-offer"} className="add-offer-button">Offer an account</NavLink>

                                <button onClick={logout}>
                                    <IoLogOut/>Log out
                                </button>
                            </>
                        )
                        :
                        (<Nav>
                            <button className="nav-item" id="nav-sign-in" onClick={login}>
                                Sign In
                            </button>
                        </Nav>)
                    }
                </Navbar.Collapse>
            </div>
        </Navbar>
    )
}

export default Header;
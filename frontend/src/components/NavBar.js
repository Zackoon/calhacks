import React from "react";
import { Link } from 'react-router-dom';
import './Navbar.css';
function NavBar(props){
    const logout = () => {
        props.logoutAction();
    }
      
    return(
        <nav className="navbar fixed-top navbar-expand-lg bg-*">
        <div className="container">
            <Link className="navbar-brand" to="/">DittyCal</Link>
            <button className="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="toggler-icon top-bar"></span>
            <span className="toggler-icon middle-bar"></span>
            <span className="toggler-icon bottom-bar"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mt-2 mb-lg-0">
                <li className="nav-item mx-auto">
                <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item mx-auto">
                <Link className="nav-link" to="/liked" >Liked Songs</Link>
                </li>
                <li>
                <button onClick={logout}>Logout</button>
                </li>
            </ul>
            </div>
        </div>
        </nav>
    )
}

export default NavBar;
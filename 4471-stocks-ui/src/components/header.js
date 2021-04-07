import { useEffect, useState } from 'react';
import '../App.css';
import logo from '../logo192.png';
import { TextField, Button, CircularProgress } from '@material-ui/core';




const Header = (props) => {
    const { loggedIn, handlePageNavigation, handleLogout, openTracker, openWatchlist, openComparer} = { ...props }

    
    
    return (
        <>
            {openTracker || openComparer ? null : <img src={logo} className="App-logo" alt="logo" />}
            <h1>Stock Tracker</h1>
            {loggedIn
                ? <div className="HeaderContainer">
                    <Button style={{ margin: '0 1vw 2vh 1vw' }} onClick={() => handlePageNavigation(0)} disabled={ openTracker } variant="contained" color="primary">Track</Button>
                    <Button style={{ margin: '0 1vw 2vh 1vw' }} onClick={() => handlePageNavigation(1)} disabled={openComparer} variant="contained" color="primary">Compare</Button>
                    <Button style={{ margin: '0 1vw 2vh 1vw' }} onClick={() => handlePageNavigation(2)} disabled={openWatchlist} variant="contained" color="primary">Watchlist</Button>
                    <Button style={{ margin: '0 1vw 2vh 1vw' }} onClick={handleLogout} variant="contained" color="primary">Logout</Button>
                </div>
                : null 
            }
        </>
    )
}

export default Header;
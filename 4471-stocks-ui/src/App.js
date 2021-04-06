import { useEffect, useState } from 'react';
import logo from './logo192.png';
import './App.css';

import { TextField, Button, CircularProgress } from '@material-ui/core';


import TrackerBase from './components/trackerBase.js'
import TrackerGraph from './components/trackerGraph.js'
const ws = new WebSocket("ws://localhost:8080/");


function App() {

    const channel = ["stock-listings", "stock-performance", "stock-compare","user-login"]

    const [subscribed, setSubscribed] = useState(false)
    const [tickers, setTickers] = useState(null)
    const [tickerValue, setTickerValue] = useState(null)
    const [tickerCompareValue, setTickerCompareValue] = useState(null)

    const [stock, setStock] = useState(null)
    const [stockCompare, setStockCompare] = useState(null)


    const [openTracker, setOpenTracker] = useState(false)
    const [openComparer, setOpenComparer] = useState(false)
    const [loggedIn, setLogin] = useState(false)

    const [startConst, setStart] = useState(null)
    const [endConst, setEnd] = useState(null)

    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)


    useEffect(() => {
        ws.onopen = () => {
            //localStorage.clear();
            console.log('WebSocket Client Connected');
            ws.send(JSON.stringify({ channel: channel[0], message: 'subscribe' }))
            const loggedUser = localStorage.getItem("loggedIn");
            if (loggedUser == "true") {
                const usernameLocal = localStorage.getItem("username");
                const passwordLocal = localStorage.getItem("password");
                setLogin(true);
                setUsername(usernameLocal)
                setPassword(passwordLocal)
                //document.getElementById("user-homepage").innerHTML = "Welcome, "+usernameLocal
            }
            else{
                var loginInput = document.getElementById("login");
                var registerInput = document.getElementById("register");
                loginInput.addEventListener("click", userLogin);
                registerInput.addEventListener("click", userRegister);
            }
        };

        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            console.log('received message...',message)
            if (message.channel == channel[0] && message.message == "subscribed") {
                console.log('sending', { channel: channel[1], message: 'subscribe' })
                ws.send(JSON.stringify({ channel: channel[1], message: 'subscribe' }))
                console.log('sending', { channel: channel[3], message: 'subscribe' })
                ws.send(JSON.stringify({ channel: channel[3], message: 'subscribe' }))
            }
            else if (message.channel == channel[1] && message.message == "subscribed") {
                console.log('sending', { channel: channel[2], message: 'subscribe' })
                ws.send(JSON.stringify({ channel: channel[2], message: 'subscribe' }))
            }

            else if (message.channel == channel[2] && message.message == "subscribed") {
                ws.send(JSON.stringify({ channel: channel[0], message: 'get' }))
                setSubscribed(true)
            }
            else if (message.channel == channel[0] && message.message != "subscribe") {
                setTickers(message.message)
                //ws.send(JSON.stringify({ channel: channel[0], message: 'get' }))
            }
        };

    }, []);

    const getStockInfo = (start, end) => {
        let startDate = start != '' ? start.replace(/\//g, "") : null
        let endDate = end != '' ? end.replace(/\//g, "") : null
        let body
        if (openComparer) {
            body = {
                channel: channel[2],
                message: { value: tickerValue, compare: tickerCompareValue, startDate: startDate, endDate: endDate }
            } 
        } else {
            body = {
                channel: channel[1],
                message: { value: tickerValue, startDate: startDate, endDate: endDate }
            }
        }
        
        console.log(openComparer, body)
        ws.send(JSON.stringify(body))
        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            console.log(message)
            if (message.channel == channel[1]) {
                setStock(message)
                setStart(startDate)
                setEnd(endDate)
            }
            else if (message.channel == channel[2]) {
                setStock(message.message.firstStock)
                setStockCompare(message.message.secondStock)
                setStart(startDate)
                setEnd(endDate)
            }
            
        };
    }

    useEffect(() => {
        console.log(stock, stockCompare)
    }, [stock, stockCompare])


    function userLogin(){
        let body
        body = {
            channel: channel[3],
            message: { username: document.getElementById("username").value, password: document.getElementById("password").value, type: document.getElementById("login").name}
        } 
        ws.send(JSON.stringify(body))
        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            console.log(message)
            if (message.channel == channel[3]) {
                setLogin(message.message.loginSuccess)
                setUsername(body.message.username)
                setPassword(body.message.password)
                localStorage.setItem('loggedIn',message.message.loginSuccess)
                localStorage.setItem('username',body.message.username)
                localStorage.setItem('password',body.message.password)
                if(!message.message.loginSuccess){
                    document.getElementById("login-message").innerHTML = message.message.loginMessage
                }
            }
            
        };
    }

    function userRegister(){
        let body
        body = {
            channel: channel[3],
            message: { username: document.getElementById("username").value, password: document.getElementById("password").value, type: document.getElementById("register").name}
        } 
        ws.send(JSON.stringify(body))
        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            console.log(message)
            if (message.channel == channel[3]) {
                setLogin(message.message.loginSuccess)
                document.getElementById("login-message").innerHTML = message.message.loginMessage
            }
            
        };
    }

    const handleLogout = () => {
        setLogin(false);
        setUsername("");
        setPassword("");
        localStorage.clear();
    };
    
    if(loggedIn){
    return (
    <div className="App">
        <header className="App-header">
        {openTracker || openComparer ? null : <img src={logo} className="App-logo" alt="logo" />}
        <h1>Stock Tracker</h1>
        {openTracker || openComparer ? null : <Button onClick={() => { setOpenTracker(true); setOpenComparer(false)}} disabled={!tickers} variant="contained" color="primary">Open</Button>}
        {openTracker || openComparer ? null : <Button onClick={() => { setOpenComparer(true); setOpenTracker(true); }} disabled={!tickers} variant="contained" color="primary">Compare</Button>}
        <Button onClick={handleLogout} variant="contained" color="primary">Logout</Button>

        <div className="Container">
            {
                openTracker
                    ? <>
                        <TrackerBase 
                                    tickers={tickers}
                                    tickerValue={tickerValue}
                                    tickerCompareValue={tickerCompareValue}
                                    setTickerValue={setTickerValue}
                                    setTickerCompareValue={setTickerCompareValue}
                                    getStockInfo={getStockInfo}
                                    openComparer={openComparer}
                                />
                           
                        
                                {stock == null
                                    ? null
                                    : <TrackerGraph
                                        tickerValue={tickerValue}
                                        tickerCompareValue={tickerCompareValue}
                                        stock={stock}
                                        stockCompare={stockCompare}
                                        openComparer={openComparer}
                                        startDate={startConst}
                                        endDate={endConst}
                                    />
                            }
                    </>
                    : null
            }
        </div> 
        </header>
    </div>
    );
    }
    else{
    return (
    <div className="App">
        <header className="App-header">
        {openTracker || openComparer ? null : <img src={logo} className="App-logo" alt="logo" />}
        <h1>Stock Tracker</h1>
        <p id="login-message"></p>
            <div className="loginForm">
                    <input type = "username" id = "username" placeholder = "Username"  style = {{width: "80%"}}/>
                    <input type = "password" id = "password" placeholder = "Password"   style = {{width: "80%"}}/>
                    <input type = "submit" id="login" name="login" value = "Login"  style = {{width: "80%"}}/>
                    <input type = "submit" id="register" name="register" value = "Register"  style = {{width: "80%"}}/>
            </div>
        <br/>
        </header>
    </div>
    );
    }

}

export default App;

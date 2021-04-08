import { useEffect, useState, createRef } from 'react';
import './App.css';
import { TextField, Button, CircularProgress } from '@material-ui/core';

import Header from './components/header.js'
import TrackerBase from './components/trackerBase.js'
import TrackerGraph from './components/trackerGraph.js'
import Watchlist from './components/watchlist.js'

const ws = new WebSocket("ws://localhost:8080/");


function App() {

    const channel = ["stock-listings", "stock-performance", "stock-compare", "user-login", "watchlist"]

    const [loading, setLoading] = useState(false)

    const [tickers, setTickers] = useState(null)
    const [tickerValue, setTickerValue] = useState(null)
    const [tickerCompany1, setTickerCompany1] = useState(null)
    const [tickerCompany2, setTickerCompany2] = useState(null)
    const [tickerCompareValue, setTickerCompareValue] = useState(null)

    const [stock, setStock] = useState(null)
    const [stockCompare, setStockCompare] = useState(null)


    const [openTracker, setOpenTracker] = useState(false)
    const [openComparer, setOpenComparer] = useState(false)
    const [openWatchlist, setOpenWatchlist] = useState(false)
    const [loggedIn, setLogin] = useState(false)

    const [startConst, setStart] = useState(null)
    const [endConst, setEnd] = useState(null)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [watchlist, setWatchlist] = useState([])

    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)

    let userInput = createRef();
    let passInput = createRef();


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
        };

        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            console.log('received message...',message)
            if (message.channel == channel[0] && message.message == "subscribed") {
                ws.send(JSON.stringify({ channel: channel[0], message: 'get' }))
                console.log('sending', { channel: channel[1], message: 'subscribe' })
                ws.send(JSON.stringify({ channel: channel[1], message: 'subscribe' }))               
            }
            else if (message.channel == channel[1] && message.message == "subscribed") {
                console.log('sending', { channel: channel[2], message: 'subscribe' })
                ws.send(JSON.stringify({ channel: channel[2], message: 'subscribe' }))
            }
            else if (message.channel == channel[2] && message.message == "subscribed") {
                console.log('sending', { channel: channel[3], message: 'subscribe' })
                ws.send(JSON.stringify({ channel: channel[3], message: 'subscribe' }))

            }
            else if (message.channel == channel[3] && message.message == "subscribed") {
                console.log('sending', { channel: channel[4], message: 'subscribe' })
                ws.send(JSON.stringify({ channel: channel[4], message: 'subscribe' }))
            }
            else if (message.channel == channel[0] && message.message != "subscribe") {
                setTickers(message.message)
                //ws.send(JSON.stringify({ channel: channel[0], message: 'get' }))
            }
            else if (message.channel == channel[4] && message.message == "subscribed") {
                //ws.send(JSON.stringify({ channel: channel[4], message: { username: username, password: password, type: 'get' } }))
            }
        };

    }, []);

    const getStockInfo = (stock, start, end) => {
        setLoading(true)
        let startDate = start != '' ? start.replace(/\//g, "") : null
        let endDate = end != '' ? end.replace(/\//g, "") : null
        let body
        if (openComparer) {
            body = {
                channel: channel[2],
                message: { value: stock, compare: tickerCompareValue, startDate: startDate, endDate: endDate }
            } 
        } else {
            body = {
                channel: channel[1],
                message: { value: stock, startDate: startDate, endDate: endDate }
            }
        }
        
        ws.send(JSON.stringify(body))
        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            if (message.channel == channel[1]) {
                setStock(message)
                setStart(startDate)
                setEnd(endDate)
                setLoading(true)
            }
            else if (message.channel == channel[2]) {
                setStock(message.message.firstStock)
                setStockCompare(message.message.secondStock)
                setStart(startDate)
                setEnd(endDate)
                setLoading(false)
            }

            setLoading(false)
        };
    }

    const navigateToStock = (stock) => {
        /*setStart("20110113")
        setEnd("20110113")
        setStartDate("2011/01/13")
        setEndDate("2011/01/13")*/
        setOpenComparer(false);
        setOpenTracker(true);
        setOpenWatchlist(false);
        setTickerValue(stock)
        var index = tickers.symbols.indexOf(stock)
        setTickerCompany1(tickers.names[index])
        
        getStockInfo(stock, "20110113", "20111207")

    }

    const getWatchlist = () => {
        let body = { channel: channel[4], message: { username: localStorage.getItem("username"), password: localStorage.getItem("password"), type: 'get' } }
        ws.send(JSON.stringify(body))
        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            setWatchlist(message.message)

        };
    }

    const addToWatchlist = (newStock) => {
        if (!watchlist.includes(newStock)) {
            let body
            body = {
                channel: channel[4],
                message: { stock: newStock, username: username, password: password, type: "insert" }
            }
            ws.send(JSON.stringify(body))
            ws.onmessage = (evt) => {
                let message = JSON.parse(evt.data)
                let list = message.message.split(',')
                setWatchlist(list)
                //ws.close()
            };
        }
    }

    const removeFromWatchlist = (delStock) => {
        if (watchlist.includes(delStock)) {
            let body
            body = {
                channel: channel[4],
                message: { stock: delStock, username: username, password: password, type: "delete" }
            }
            ws.send(JSON.stringify(body))
            ws.onmessage = (evt) => {
                let message = JSON.parse(evt.data)
                let list = (message.message != [] || message.message != "") ? message.message.split(',') : []
                setWatchlist(list)
                //ws.close()
            };
        }
    }


    function userLogin() {
        let body
        body = {
            channel: channel[3],
            message: { username: userInput.current.value, password: passInput.current.value, type: "login"}
        } 
        ws.send(JSON.stringify(body))
        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
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
            message: { username: userInput.current.value, password: passInput.current.value, type: "register" }
        } 
        ws.send(JSON.stringify(body))
        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            if (message.channel == channel[3]) {
                setLogin(message.message.loginSuccess)
                document.getElementById("login-message").innerHTML = message.message.loginMessage
            }
            
        };
    }

    const handleLogout = () => {
        setOpenComparer(false);
        setOpenTracker(false);
        setLogin(false);
        setUsername("");
        setPassword("");
        localStorage.clear();
        window.location.reload();
    };

    const handlePageNavigation = (type) => {
        setStock(null)
        setStockCompare(null)
        setTickerValue(null)
        setTickerCompareValue(null)

        if (type == 0) {
            setOpenTracker(true);
            setOpenComparer(false);
        } else if (type == 1) {
            setOpenComparer(true);
            setOpenTracker(false);
        } else if (type == 2) {
            setOpenWatchlist(true);
        }
    }
    
    if(loggedIn){
        return (
        <div className="App">
            <header className="App-header">
                    {openWatchlist
                        ? <>
                            <Watchlist
                                navigateToStock={navigateToStock}
                                getWatchlist={getWatchlist}
                                addToWatchlist={addToWatchlist}
                                removeFromWatchlist={removeFromWatchlist}
                                tickers={tickers}
                                watchlist={watchlist}
                                setWatchlist={setWatchlist}
                                openWatchlist={openWatchlist}
                                setOpenWatchlist={setOpenWatchlist} />
                        </>
                        : null}
                <Header
                    handlePageNavigation={handlePageNavigation}
                    openTracker={openTracker}
                    openComparer={openComparer}
                    handleLogout={handleLogout}
                    loggedIn={loggedIn}
                />

                <div className="Container">
                    {
                        openTracker || openComparer
                        ?  <>
                                    <TrackerBase 
                                            loading={loading}
                                            tickers={tickers}
                                            tickerValue={tickerValue}
                                            tickerCompareValue={tickerCompareValue}
                                            setTickerValue={setTickerValue}
                                            setTickerCompany1={setTickerCompany1}
                                            setTickerCompany2={setTickerCompany2}
                                            setTickerCompareValue={setTickerCompareValue}
                                            getStockInfo={getStockInfo}
                                            openComparer={openComparer}
                                            startDate={startDate}
                                            endDate={endDate}
                                            setStartDate={setStartDate}
                                            setEndDate={setEndDate}
                                            />
                           
                        
                                            {(stock == null) || openComparer && (stockCompare == null)
                                                ? null
                                                : <TrackerGraph
                                                    tickerValue={tickerValue}
                                                    tickerCompareValue={tickerCompareValue}
                                                    tickerCompany1={tickerCompany1}
                                                    tickerCompany2={tickerCompany2}
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
            <Header 
            />
            <p id="login-message"></p>
                <div className="LoginContainer">
                    <TextField style={{ marginBottom: '1vh' }} inputRef={userInput} fullWidth type="username" id="username" name="username" placeholder="Username" />
                    <TextField style={{ marginBottom: '4vh' }} inputRef={passInput} fullWidth type="password" id="password" name="password" placeholder="Password" />

                    <Button onClick={() => userLogin()} style={{ marginBottom: '1vh' }} fullWidth variant="contained" color="primary">Login</Button>
                    <Button onClick={() => userRegister()} fullWidth variant="contained" color="primary">Register</Button>
                </div>
            <br/>
        </div>
        );
        }
}

export default App;
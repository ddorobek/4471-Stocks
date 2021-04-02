import { useEffect, useState } from 'react';
import logo from './logo192.png';
import './App.css';

import { TextField, Button, CircularProgress } from '@material-ui/core';


import TrackerBase from './components/trackerBase.js'
import TrackerGraph from './components/trackerGraph.js'



const ws = new WebSocket("ws://localhost:8080/");


function App() {

    const channel = ["stock-listings", "stock-performance", "stock-compare"]

    const [subscribed, setSubscribed] = useState(false)
    const [tickers, setTickers] = useState(null)
    const [tickerValue, setTickerValue] = useState(null)
    const [stock, setStock] = useState(null)

    const [openTracker, setOpenTracker] = useState(false)
    const [openComparer, setOpenComparer] = useState(false)


    useEffect(() => {
        ws.onopen = () => {
            console.log('WebSocket Client Connected');
            ws.send(JSON.stringify({ channel: channel[0], message: 'subscribe' }))
        };

        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            console.log('received message...',message)
            if (message.channel == channel[0] && message.message == "subscribed") {
                console.log('sending', { channel: channel[1], message: 'subscribe' })
                ws.send(JSON.stringify({ channel: channel[1], message: 'subscribe' }))
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
        console.log(startDate, endDate)

        let body = {
            channel: channel[1],
            message: { value: tickerValue, startDate: startDate, endDate: endDate}
        }
        console.log(body)
        ws.send(JSON.stringify(body))
        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            setStock(message)
        };
    }




  return (
    <div className="App">
      <header className="App-header">
        {openTracker || openComparer ? null : <img src={logo} className="App-logo" alt="logo" />}
        <h1>Stock Tracker</h1>
        {openTracker || openComparer ? null : <Button onClick={() => { setOpenTracker(true); setOpenComparer(false)}} disabled={!tickers} variant="contained" color="primary">Open</Button>}
        {openTracker || openComparer ? null : <Button onClick={() => { setOpenComparer(true); setOpenTracker(false); }} disabled={!tickers} variant="contained" color="primary">Compare</Button>}

        <div className="Container">
            {
                openTracker
                    ? <>
                        <TrackerBase 
                            tickers={tickers}
                            tickerValue={tickerValue}
                            setTickerValue={setTickerValue}
                            getStockInfo={getStockInfo}
                              />
                           
                        
                              {stock == null
                                  ? null
                                  : <TrackerGraph tickerValue={tickerValue} stock={stock} />
                            }
                    </>
                    : null
            }
        </div> 
      </header>
    </div>
  );
}

export default App;

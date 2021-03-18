import { useEffect, useState } from 'react';
import logo from './logo192.png';
import './App.css';

import { TextField, Button, CircularProgress } from '@material-ui/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Autocomplete from '@material-ui/lab/Autocomplete';


function App() {

    const ws = new WebSocket("ws://localhost:8080/");
    const channel = ["stock-listings", "stock-performance", "stock-compare"]

    const [subscribed, setSubscribed] = useState(false)
    const [tickers, setTickers] = useState(null)
    const [tickerValue, setTickerValue] = useState(null)
    const [stockDate, setStockDate] = useState('')
    const [stock, setStock] = useState(null)


    /*ws.onmessage = (evt) => {
        let message = JSON.parse(evt.data)
        console.log(message)
        if (message.channel == channel[0] && message.message == "subscribe") {
            setSubscribed([true, subscribed[1], subscribed[2]])
        }
        if (message.channel == channel[1] && message.message == "subscribe") {
            setSubscribed([subscribed[0], true, subscribed[2]])
        }
        if (message.channel == channel[2] && message.message == "subscribe") {
            setSubscribed([subscribed[0], subscribed[1], true])
        }
        if (message.channel == channel[0] && message.message != "subscribe") {
            setTickers(message.message)
        }

    };*/

    useEffect(() => {
        ws.onopen = () => {
            console.log('WebSocket Client Connected');
            ws.send(JSON.stringify({ channel: channel[0], message: 'subscribe' }))
            ws.send(JSON.stringify({ channel: channel[1], message: 'subscribe' }))
            ws.send(JSON.stringify({ channel: channel[2], message: 'subscribe' }))
        };

        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            console.log(message)
            if (message.channel == channel[2] && message.message == "subscribed") {
                setSubscribed(true)
                ws.close()
            }
            

        };

    }, []);

    useEffect(() => {
        if (subscribed) {
            console.log('subscribed!')
            let body = { channel: 'stock-listings', message: 'get' }
            ws.onopen = () => {
                ws.send(JSON.stringify(body)) 
            };

            ws.onmessage = (evt) => {
                let message = JSON.parse(evt.data)
                console.log(message)
                if (message.channel == channel[0] && message.message != "subscribed") {
                    setTickers(message.message)
                    ws.close()
                }

            };
        }
        
    }, [subscribed])

    const getStockInfo = () => {
        let body = {
            channel: channel[1],
            message: { value: tickerValue, date: stockDate }
        }
        console.log(body)
        ws.send(JSON.stringify(body))
        ws.onmessage = (evt) => {
            let message = JSON.parse(evt.data)
            setStock(message)
        };
    }

    useEffect(() => {
        console.log('stock', stock)
    }, [stock])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>
                  Stock Tracker
        </h1>
        <div className="Container">
            {
                tickers != null
                    ? <>
                        <Autocomplete
                            className="TextField"
                            options={tickers}
                            value={tickerValue}
                            onChange={(event, newValue) => {
                                setTickerValue(newValue);
                            }}
                            color="primary"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Choose a ticker"
                                    variant="outlined"
                                    inputProps={{
                                        ...params.inputProps,
                                    }}
                                />
                            )}
                        />
                        {tickerValue != null
                                  ? <>
                                      <TextField className="TextField" label="Enter date" variant="outlined" color="primary" placeholder="YYYYMMDD" value={stockDate} onChange={(e) => setStockDate(e.target.value)} />
                                      <Button fullWidth variant="contained" color="primary" onClick={() => getStockInfo()}>See Stock</Button>
                              </>
                              : null
                        }
                        {stock == null
                            ? null
                            : <>
                                <p>{tickerValue} Stock</p>
                                      <LineChart
                                          width={500}
                                          height={300}
                                          data={stock.message}
                                          margin={{
                                              top: 5,
                                              right: 30,
                                              left: 20,
                                              bottom: 5,
                                          }}
                                      >
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis dataKey="price" />
                                          <YAxis domain={['dataMin', 'dataMax']}/>
                                          <Tooltip />
                                          <Legend />
                                          <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
                                          {/*<Line type="monotone" dataKey="uv" stroke="#82ca9d" />*/}
                                      </LineChart>
                                
                            </>
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

const express = require('express');
const redis = require('redis');
const WebSocket = require('ws');
const mysql = require('mysql');


const app = express();
const pubURL = 'http://localhost:3005'
const config = require('./config.json')

const subscriber = redis.createClient();
//console.log(subscriber)
const publisher = redis.createClient();
const wss = new WebSocket.Server({ port: 8080 });

const channel = ["stock-listings", "stock-performance", "stock-compare"]

const conCredentials = {
    host: config.host,
    user: config.user,
    password: config.password
}

wss.on('connection', function connection(ws) {
    ws.onmessage = (evt) => {
        let message = JSON.parse(evt.data)

        console.log(message)
        if (message.message == "subscribe") {
            subscriber.subscribe(message.channel);
            
        } else {
            if (message.channel == channel[0]) {
                query = 'SELECT DISTINCT symbol FROM Temp_Stocks.tickers;'
                let con = mysql.createConnection(conCredentials);

                con.connect(function (err) {
                    if (err) throw err;
                    console.log("Connected to DB!");

                    con.query(query, function (err, result) {
                        if (err) throw err; 
                        let tickers = Object.values(result).map(res => res.symbol)
                        message = { ...message, message: tickers }
                        //publisher.publish(channel[0], {message: 'sadsaddsad' });
                        console.log('publishing...')
                        publisher.publish(channel[0], JSON.stringify(message));
                        //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))
                    });
                    con.end()
                });

                //get tickers from sql
                
            }
            if (message.channel == channel[1]) {
                query = 'SELECT * FROM Stocks.' + message.message.value + '_stock WHERE date = ' + message.message.date + ';'
                let con = mysql.createConnection(conCredentials);

                con.connect(function (err) {
                    if (err) throw err;
                    console.log("Connected to DB!");

                    con.query(query, function (err, result) {
                        if (err) throw err;
                        let stock = Object.values(result).filter((res, i) => i % 25 == 0)

                        //console.log(stock)
                        message = { ...message, message: stock }
                        //publisher.publish(channel[0], {message: 'sadsaddsad' });
                        publisher.publish(channel[1], JSON.stringify(message));
                        //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))*/
                    });
                    con.end()
                });
            }
            if (message.channel == channel[2]) {
                publisher.publish(channel[2], 'hello3');
            }
            
        }

       
        
        

    };
    // broadcast on web socket when receving a Redis PUB/SUB Event
    subscriber.on('message', function (channel, message) {
        console.log('subscriber sending message to ws...')
        ws.send(message);
    })
    
});



subscriber.on('subscribe', function (channel, count) {

    console.log('Subscribed to channel: ' + channel, ' ... sending back to client')
    publisher.publish(channel, JSON.stringify({ channel: channel, message: 'subscribed' }))
    //subscriber.message(JSON.stringify({ channel: channel, message: 'subscribed' }))
    //ws.send(JSON.stringify({ channel: channel, message: 'subscribed' }))
    //ws.close()
});






app.listen(3006,() => {
    console.log("server is listening to port 3006");
})
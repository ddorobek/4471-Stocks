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
                stockListingsService(message)
            }
            if (message.channel == channel[1]) {
                stockPerformanceService(message)
            }
            if (message.channel == channel[2]) {
                stockComparisonService(message)
            }
            
        }

       
        
        

    };
    // broadcast on web socket when receving a Redis PUB/SUB Event
    subscriber.on('message', function (channel, message) {
        console.log('subscriber sending message to ws...')
        ws.send(message);
    })

    ws.onclose = () => {
        console.log('closing')
        ws.close()

    }
});



subscriber.on('subscribe', function (channel, count) {

    console.log('Subscribed to channel: ' + channel, ' ... sending back to client')
    publisher.publish(channel, JSON.stringify({ channel: channel, message: 'subscribed' }))
    //subscriber.message(JSON.stringify({ channel: channel, message: 'subscribed' }))
    //ws.send(JSON.stringify({ channel: channel, message: 'subscribed' }))
    //ws.close()
});


function stockListingsService(message) {
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
}

function stockPerformanceService(message) {
    let query
    if (message.message.startDate == null) {
        //start date is null, get data from beginning of data to end date range
        query = 'SELECT * FROM Stocks.' + message.message.value + '_stock WHERE date <= ' + message.message.endDate + ';'
    }
    else if (message.message.endDate == null) {
        //end date is null, get data from end date to end of data
        query = 'SELECT * FROM Stocks.' + message.message.value + '_stock WHERE date >= ' + message.message.startDate + ';'
    }
    else {
        query = 'SELECT * FROM Stocks.' + message.message.value + '_stock WHERE date >= ' + message.message.startDate + ' AND date <= ' + message.message.endDate + ';'
    }
    console.log(query)
    let con = mysql.createConnection(conCredentials);

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected to DB!");

        con.query(query, function (err, result) {
            if (err) throw err;
            let stock = Object.values(result).filter((res, i) => i % 130 == 0)

            //console.log(stock)
            message = { ...message, message: stock }
            //publisher.publish(channel[0], {message: 'sadsaddsad' });
            publisher.publish(channel[1], JSON.stringify(message));
            //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))*/
        });
        con.end()
    });
}

function stockComparisonService(message) {
    let queryFirst
    let querySecond
    console.log(message)
    if (message.message.startDate == null) {
        //start date is null, get data from beginning of data to end date range
        queryFirst = 'SELECT * FROM Stocks.' + message.message.value + '_stock WHERE date <= ' + message.message.endDate + ';'
        querySecond = 'SELECT * FROM Stocks.' + message.message.compare + '_stock WHERE date <= ' + message.message.endDate + ';'
    }
    else if (message.message.endDate == null) {
        //end date is null, get data from end date to end of data
        queryFirst = 'SELECT * FROM Stocks.' + message.message.value + '_stock WHERE date >= ' + message.message.startDate + ';'
        querySecond = 'SELECT * FROM Stocks.' + message.message.compare + '_stock WHERE date >= ' + message.message.startDate + ';'

    }
    else {
        queryFirst = 'SELECT * FROM Stocks.' + message.message.value + '_stock WHERE date >= ' + message.message.startDate + ' AND date <= ' + message.message.endDate + ';'
        querySecond = 'SELECT * FROM Stocks.' + message.message.compare + '_stock WHERE date >= ' + message.message.startDate + ' AND date <= ' + message.message.endDate + ';'
    }

    let con = mysql.createConnection(conCredentials);

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected to DB!");

        con.query(queryFirst, function (err, result) {
            if (err) throw err;
            let first = Object.values(result).filter((res, i) => i % 130 == 0)

            con.query(querySecond, function (err, result) {
                if (err) throw err;
                let second = Object.values(result).filter((res, i) => i % 130 == 0)

                //console.log(stock)
                message = { ...message, message: { firstStock: first, secondStock: second } }
                //publisher.publish(channel[0], {message: 'sadsaddsad' });
                publisher.publish(channel[1], JSON.stringify(message));
                con.end()

                //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))*/
            });
            //console.log(stock)
            //message = { ...message, message: { first: stock } }
            //publisher.publish(channel[0], {message: 'sadsaddsad' });
            //publisher.publish(channel[1], JSON.stringify(message));
            //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))*/
        });

        
    });
}




app.listen(3006,() => {
    console.log("server is listening to port 3006");
})
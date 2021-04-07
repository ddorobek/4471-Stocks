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

const channel = ["stock-listings", "stock-performance", "stock-compare", "user-login", "watchlist"]
var auth = {loginMessage:'', loginSuccess:null}
const conCredentials = {
    host: config.host,
    user: config.user,
    password: config.password
}   
    const watchlistSize = 5;

    const dates = [
        "20110113",
        "20110124",
        "20110203",
        "20110215",
        "20110310",
        "20110316",
        "20110413",
        "20110426",
        "20110503",
        "20110518",
        "20110602",
        "20110616",
        "20110706",
        "20110721",
        "20110818",
        "20110829",
        "20110919",
        "20110930",
        "20111020",
        "20111031",
        "20111121",
        "20111125",
        "20111129",
        "20111206",
        "20111207",
    ]

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
            if(message.channel == channel[3]){
                userAuthentication(message)
            }
            if(message.channel == channel[4]){
                watchlist(message)
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



function watchlist(message) {
    let con = mysql.createConnection(conCredentials);
    con.connect(function (err) {
        console.log("Connected to DB!", message.message);
        if(message.message.type == "get"){
            query = 'SELECT watchlist FROM Temp_Stocks.accounts WHERE username = "'+message.message.username+'" AND pass = "'+message.message.password+'";'
            con.query(query, function (err, result) {
                if (err) throw err;
                let finalResult
                if (result[0].watchlist == null) {
                    finalResult = []
                } else {
                    finalResult = result[0].watchlist.split(",")
                }

                message = { ...message, message: finalResult }
                console.log('publishing...')
                publisher.publish(channel[4], JSON.stringify(message));
                con.end()
            })
       }
       else if(message.message.type == "insert"){
            let stock = message.message.stock
            query = 'SELECT watchlist FROM Temp_Stocks.accounts WHERE username = "'+message.message.username+'" AND pass = "'+message.message.password+'";'
            con.query(query, function (err, result) {
                if (err) throw err;
                let watchlist = result[0].watchlist == null ? [] : (result[0].watchlist).split(",")

                let finalWatchlist = result[0].watchlist == null ? stock : result[0].watchlist+","+stock
                query = 'UPDATE Temp_Stocks.accounts SET watchlist = "'+finalWatchlist+'" WHERE username = "'+message.message.username+'" AND pass = "'+message.message.password+'";'
                con.query(query, function (err, result) {
                    if (err) throw err;
                    message = { ...message, message: finalWatchlist }
                    console.log('publishing...')
                    publisher.publish(channel[4], JSON.stringify(message));
                    con.end()
                })
                
            })
       }
       else if(message.message.type == "delete"){
            let stock = message.message.stock
            query = 'SELECT watchlist FROM Temp_Stocks.accounts WHERE username = "'+message.message.username+'" AND pass = "'+message.message.password+'";'
            con.query(query, function (err, result) {
                if (err) throw err;
                let watchlist = (result[0].watchlist).split(",")
                console.log(watchlist)
                finalWatchlist = watchlist.filter(s => s != stock)
                finalWatchlist = finalWatchlist.join(",")
                
                query = 'UPDATE Temp_Stocks.accounts SET watchlist = "'+finalWatchlist+'" WHERE username = "'+message.message.username+'" AND pass = "'+message.message.password+'";'
                con.query(query, function (err, result) {
                    if (err) throw err;
                    message = { ...message, message: finalWatchlist }
                    console.log('publishing...')
                    publisher.publish(channel[4], JSON.stringify(message));
                    con.end()
                })
            })    
       }
    })
}


function userAuthentication(message){
    //console.log("USER AUTHENTICATION MESSAGE: ", message)
    query = 'SELECT * FROM Temp_Stocks.accounts WHERE username = "'+message.message.username+'" AND pass = "'+message.message.password+'";'
    let con = mysql.createConnection(conCredentials);
    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected to DB!");

        con.query(query, function (err, result) {
            if (err) throw err;
            if(result.length == 0)
            {
                if(message.message.type == "login"){
                    auth.loginSuccess = false;
                    auth.loginMessage = "Login failed, account does not exist."
                    message = { ...message, message: auth }
                    console.log('publishing...')
                    publisher.publish(channel[3], JSON.stringify(message));
                    //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))
                    con.end()
                }
                else if(message.message.type == "register"){
                    query = 'INSERT INTO Temp_Stocks.accounts(id,username,pass,watchlist) VALUES (null,"'+message.message.username+'","'+message.message.password+'",null);'
                    con.query(query, function (err, result) {
                        if (err) throw err;
                        auth.loginSuccess = false;
                        auth.loginMessage = "Registration successful."
                        message = { ...message, message: auth }
                        console.log('publishing...')
                        publisher.publish(channel[3], JSON.stringify(message));
                        //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))
                        con.end()
                    });
                }
            }
            else{
                if(message.message.type == "login"){
                    auth.loginSuccess = true;
                    auth.loginMessage = "Login successful."
                    message = { ...message, message: auth }
                    console.log('publishing...')
                    publisher.publish(channel[3], JSON.stringify(message));
                    //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))
                    con.end()
                }
                else if(message.message.type == "register"){
                    auth.loginSuccess = false;
                    auth.loginMessage = "Registration failed, account already exists."
                    message = { ...message, message: auth }
                    console.log('publishing...')
                    publisher.publish(channel[3], JSON.stringify(message));
                    //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))
                    con.end()
                }
            }
        });
    });
}


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

    let exchange = null;
    query1 = 'SELECT exchange, COUNT(*) c FROM Stocks.' + message.message.value + '_stock GROUP BY exchange ORDER BY c DESC LIMIT 1;'
    let con = mysql.createConnection(conCredentials);
    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected to DB!");

        con.query(query1, function (err, result) {
            if (err) throw err;
            exchange = result[0].exchange

            let query2
            if(message.message.startDate == message.message.endDate)
            {
                query2 = 'SELECT time, FLOOR(AVG(price)) as price FROM Stocks.' + message.message.value + '_stock WHERE exchange = "'+exchange+'" AND date = ' + message.message.startDate + ' GROUP BY time;'
            }
            else
            {
                if (message.message.startDate == null) {
                    //start date is null, get data from beginning of data to end date range
                    query2 = 'SELECT date, price as price FROM Stocks.' + message.message.value + '_stock WHERE exchange = "'+exchange+'" AND date <= ' + message.message.endDate + ';'
                }
                else if (message.message.endDate == null) {
                    //end date is null, get data from end date to end of data
                    query2 = 'SELECT date, price as price FROM Stocks.' + message.message.value + '_stock WHERE exchange = "'+exchange+'" AND date >= ' + message.message.startDate + ';'
                }
                else {
                    query2 = 'SELECT date, price as price FROM Stocks.' + message.message.value + '_stock WHERE exchange = "'+exchange+'" AND date >= ' + message.message.startDate + ' AND date <='+ message.message.endDate +';'
                }
            }

            con.query(query2, function (err, result) {
                if (err) throw err;
                let dateResult = [];
                let dateNums = 1;

                if(message.message.startDate != message.message.endDate){
                    for(var i = 0; i<result.length; i++){
                        var a = result[i].date;
                        dateResult.push(a);
                    }
                    dateNums = [...new Set(dateResult)].length
                }

                let ratio = Math.ceil(result.length*(0.01/dateNums))
                let stock = Object.values(result).filter((res, i) => i % ratio == 0)
                
                for(var i=0; i<stock.length; i++)
                {
                    stock[i].price = stock[i].price/10000
                    if(message.message.startDate == message.message.endDate)
                    {
                        stock[i].time = msToTime(stock[i].time);
                    }
                    else
                    {
                        //stock[i].date = monthDay(stock[i].date);
                    }
                }

                message = { ...message, message: stock }
                //publisher.publish(channel[0], {message: 'sadsaddsad' });
                publisher.publish(channel[1], JSON.stringify(message));
                //ws.send((JSON.stringify({ channel: message.channel, message: message.message, status: 200 })))*/
                con.end()
            });
        });

    });


}

function msToTime(s) {
    // Pad to 2 or 3 digits, default is 2
    var pad = (n, z = 2) => ('00' + n).slice(-z);
    return pad(s/3.6e6|0) + ':' + pad((s%3.6e6)/6e4 | 0) + ':' + pad((s%6e4)/1000|0);
}

function monthDay(s) {
    var date = '' + s;
    date = date.replace('2011','');
    date = date.replace('\r','');
    return date.substr(0, 2) + '/' + date.substr(2);
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
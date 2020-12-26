//Vestler Server 

const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require('express-fileupload');
const db = require("./db");
const axios = require('axios');
app.use(express.json({limit:'500mb'}));
app.use(express.urlencoded({limit:'500mb'}))
app.use(cors());
app.use(fileUpload());

// add logging system

const morgan = require("morgan");
app.use(morgan("tiny"));

//add routes
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const stocksRoutes = require('./routes/stocks');
const transactionsRoutes = require('./routes/transactions');
const optionsRoutes = require('./routes/options');
//need stocks, investments, transactions, posts, comments, likes, dislikes
app.use("/users", usersRoutes);
app.use("/", authRoutes);
app.use('/stocks',stocksRoutes);
app.use('/transactions',transactionsRoutes);
app.use('/options',optionsRoutes);

/** 404 handler */

app.use(function (req, res, next) {
    const err = new Error("Not Found");
    err.status = 404;
  
    // pass the error to the next piece of middleware
    return next(err);
  });
  
  /** general error handler */
  
  app.use(function (err, req, res, next) {
    if (err.stack) console.log(err.stack);
    console.log(err.message,'err.message')
    res.status(err.status || 500);
    return res.json({
      status: err,
      message: err.stack
    });
  });

  //make api calls to 'https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=bspkd2vrh5rehfh23ma0'
//make api call per stock in db
//track how many calls were made
//can only make 60 api calls per minute
//MAYBE THE SANDBOX API WILL LET 300 CALLS PER MINUTE

//call a function every second. that way the api rate stays under 60 calls per min.
//make this call for each stock in db.
//set interval should call function that grabs stock from the list
//algo should get list of all stocks then call set interval
/*let allsymbols = await db.query('select symbol from stocks');
async function insertData(data,symb){

}
async function getStockData(){
  if(allsymbols.rows.length === 0){
    clearInterval(getStockData);
  }
  let symb = allsymbols.rows.pop();
  let res = await axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${symb}&resolution=1&from=1605543327&to=1605629727`)
  insertData(res.data, symb);
}
if(allsymbols){
  setInterval(getStockData(),1000);
}*/
/*let allStocks;
let tId;
let iId;
startStocks();
function startTimer(){
  console.log('calling timer');
  clearTimeout(tId);
  iId = setInterval(()=>getStockData(),1000);
}
async function startStocks(){
  let res = await axios.get(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=bspkd2vrh5rehfh23ma0`);
  if(res.data){
    allStocks = res.data;
    tId = setTimeout(startTimer,1000);
  }
}
async function insertData(nStock){
  console.log('inserting',nStock);
  if(nStock.marketCapitalization){
    await db.query(`INSERT INTO stocks (symbol, name, currency, type, image_url, exchange, 
      website, market_cap, share_outstanding, country)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [nStock.symbol, nStock.description, nStock.currency, nStock.type, nStock.logo, nStock.exchange,
       nStock.weburl, nStock.marketCapitalization, nStock.shareOutstanding, nStock.country])
  }
  else{
    getStockData();
  }
  
}
async function getStockData(){
  if(allStocks.length === 0){
    clearInterval(iId);
  }
  let stock = allStocks.pop();
  if(stock.type){
    try{
      let resp = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=bspkd2vrh5rehfh23ma0`)
      insertData({...stock,...resp.data});
    }catch(err){
      allStocks.push(stock);
    }
    
  }
  else{
    getStockData();
  }
  
}*/

module.exports = app;
/**Routes for stocks */
const express = require('express');
const router = express.Router();
const axios = require('axios');

const {authRequired} = require('../middleware/auth');

const Stock = require('../models/stocks');

//GET ALL STOCKS (symbol,currency,name, type)
router.get('/', authRequired, async function(req,res,next){
    try{
        const stocks = await Stock.getAll();
        return res.json({stocks})
    }catch(err){
        return next(err);
    }
})

//route for searching for stock by name
router.get('/search/:term', authRequired, async function(req,res,next){
    try{
        const term = req.params.term;
        const results = await Stock.search(term);
        return res.json(results);
    }catch(err){
        return res.json(err);
    }
})

//route for getting most recent data about a given stock
router.get('/data/:symbol', authRequired, async function(req,res,next){
    
    let symbol = req.params.symbol;

    try{
        let result = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=bspkd2vrh5rehfh23ma0`);
        
        //record stock data into stock_data table
        let record = await Stock.addQuote({...result.data,symbol:symbol});
        
        return res.json({stock_data:record});
    }catch(err){
        console.log('symbol error',err);
    }
})

module.exports = router;
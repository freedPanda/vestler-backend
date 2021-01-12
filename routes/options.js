const express = require("express");
const router = express.Router();
const { ensureCorrectUser, authRequired } = require("../middleware/auth");
const axios = require('axios');
const Transaction = require('../models/transactions');
const Account = require('../models/accounts');
const User = require('../models/users');
const Option = require('../models/options');

//get options that are pending complete as in the expiration date.
router.get('/pending/:username',ensureCorrectUser, async function(req,res,next){
    const username = req.params.username;
    const userid = await User.getId(username);
    try{
        const result = await Option.getUserPendingOptions(userid);
        return res.json(result);
    }catch(err){
        return next(err);
    }
});

//route to all of a users up to date options. this route make api calls to update
//options that have expired time
router.get('/all/:username',ensureCorrectUser, async function(req,res,next){
    const username = req.params.username;
    const userid = await User.getId(username);
    try{
        //first check for updates and udpate records
        const aResult = await Option.getExpiredOptions(userid);
        
        if(aResult){
            for(let option of aResult){
                //make date objects using end_date and p_date
                //adjust day using setDate(d.getDate()-2)
                //make eDate and sDate use the dateobjects
                let eDate = option.end_date.toString();
                eDate = eDate.slice(0,10);
                let d = new Date(Number(option.p_date));
                
                d.setDate(d.getDate()-2);
                
                let sDate = d.getTime().toString();
                
                sDate = sDate.slice(0,10);

                //making request
                let resp = await axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${option.symbol}&resolution=1&from=${sDate}&to=${eDate}&token=bspkd2vrh5rehfh23ma0`);
                //acquiring price from c property
                let result_price = resp.data.c.pop();
                let result = await Option.update({result_price:Number(result_price),id:option.id});
                if(option.o_type === 'short' && option.target > result_price){
                    //this is a success. deposit to account must be made at twice the amount
                    
                        try{
                            let re = await Account.depositOption(option.amount, userid);
                            console.log('made deposit because of short option',re);
                        }catch(err){
                            console.log(err);
                        }
                    
                }
                if(option.o_type === 'put' && option.target < result_price){
                    //this is a success. deposit to account must be made at twice the amount
                    
                        try{
                            let re = await Account.depositOption(option.amount, userid);
                            console.log('made deposit because of put option',re);
                        }catch(err){
                            console.log(err);
                        }
                    
                }
            }
        }
        //second return all records
        const result = await Option.getUserOptions(userid);
        return res.json(result);
    }catch(err){
        return next(err);
    }
    
});

//route for placing a "put" or a "bet that the given stock will have price higher than
//the target price by the given time and date"
router.post('/put/:symbol/:username',ensureCorrectUser, async function(req,res,next){
    const username = req.params.username;
    const option = req.body;
    //get userid
    const userid = await User.getId(username);
    //get users balance
    const balance = await Account.getBalance(userid);
    //check user balance against bet placed
    if(balance < option.amount){
        return next({
            status:400,
            message:'Insufficient Funds'
        })
    };
    let resp = await Account.purchase({id:userid,balance:balance,amount:option.amount});
    if(resp){
        const result = await Option.put(userid, option);
        return res.status(201).json(result);
    }
    return next({status:500});
    
});

//route for placing a "short" or a "bet that the given stock will have price lower than
//the target price by the given time and date"
router.post('/short/:symbol/:username',ensureCorrectUser, async function(req,res,next){
    const username = req.params.username;
    const option = req.body;
    //get userid
    const userid = await User.getId(username);
    //get users balance
    const balance = await Account.getBalance(userid);
    //check user balance against bet placed
    if(balance < option.amount){
        return next({
            status:400,
            message:'Insufficient Funds'
        })
    };
    //deduct from users account and then return successful completion
    let resp = await Account.purchase({id:userid,balance:balance,amount:option.amount});
    if(resp){
        const result = await Option.short(userid, option);
        return res.status(201).json(result);
    }
    return next({status:500});
});

module.exports = router;
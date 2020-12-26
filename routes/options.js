const express = require("express");
const router = express.Router();
const { ensureCorrectUser, authRequired } = require("../middleware/auth");
const axios = require('axios');
const Transaction = require('../models/transactions');
const Account = require('../models/accounts');
const User = require('../models/users');
const Option = require('../models/options');

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
            
                //adjusting p_date to prep the date for making a request.
                let adjusted_p_date = new Date(Number(option.p_date));
                let day = adjusted_p_date.getDate();
                day = day - 2;
                adjusted_p_date.setDate(day);
                adjusted_p_date =`${adjusted_p_date.getTime()}`

                //making request
                let resp = await axios.get('https://finnhub.io/api/v1/stock/candle?symbol=A&resolution=1&from=1608159033&to=1608763860&token=bspkd2vrh5rehfh23ma0');
                
                //acquiring price from c property
                let result_price = resp.data.c.pop();
                console.log('result price',result_price);
                let result = await Option.update({result_price:result_price,id:option.id});
                if(option.type === 'short' && target > result_price){
                    //this is a success. deposit to account must be made at twice the amount
                    if(result){
                        try{
                            let re = await Account.depositOption(option.amount * 2, userid);
                            console.log('made deposit because of short option',re);
                        }catch(err){
                            console.log(err);
                        }
                    }
                }
                if(option.type === 'put' && target < result_price){
                    //this is a success. deposit to account must be made at twice the amount
                    if(result){
                        try{
                            let re = await Account.depositOption(option.amount * 2, userid);
                            console.log('made deposit because of put option',re);
                        }catch(err){
                            console.log(err);
                        }
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
    const balance = await Account.getBalance({id:userid});
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
        return res.json({status:201,...result});
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
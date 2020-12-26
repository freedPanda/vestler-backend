/** transactions routes */
const express = require("express");
const router = express.Router();
const { ensureCorrectUser, authRequired } = require("../middleware/auth");
const db = require('../db');

const Transaction = require('../models/transactions');
const Account = require('../models/accounts');
const User = require('../models/users');

/**CREATE TABLE public.transactions(
    id serial primary key,
    price float not null,
    qty integer not null,
    total float not null,
    symbol text not null references public.stocks,
    user_id integer not null references public.users,
    t_type text not null,
    holding boolean not null
);

CREATE TABLE public.accounts(
    id serial primary key,
    balance float DEFAULT 0,
    user_id integer not null references public.users
); */
// ROUTE FOR RETRIEVING USERS INVESTMENTS - investments are a calculation of all the stocks
//that are 
router.get(`/investments/:username`, ensureCorrectUser, async function(req,res,next){
    const username = req.params.username;
    let user_id = await User.getId(username);
    let investments = await Transaction.getUserInvestments(user_id);
    return res.json(investments);
})

//router for getting balance
router.get(`/balance/:username`, ensureCorrectUser, async function(req,res,next){
    const username = req.params.username;
    let userid = await User.getId(username);
    let balance = await Account.getBalance(userid);
    return res.json(balance);
})

router.get('/netgains/:username', ensureCorrectUser, async function(req,res,next){
    const username = req.params.username;
    let userid = await User.getId(username);
    try{
        let netgains = await Transaction.getNetGains(userid);
        return res.json(netgains);
    }catch(err){
        console.log(err);
    }
})

//ROUTE FOR GETTING ONE INVESTMENT
/*router.get(`/investments/:symbol/:username`, ensureCorrectUser, async function(req,res,next){
    const symbol = req.params.symbol;
    const username = req.params.symbol;
    let user_id = await User.getId(username);
    let investment = await Transaction.getUserInvestment(user_id);
    return res.json(investment);

})*/

// ROUTE FOR PURCHASING STOCK
router.post(`/:username/purchase/:symbol`, ensureCorrectUser, async function(req,res,next){
    //req.body contains the stock symbol
    let t = req.body;
    const username = req.params.username;
    //get users id to pull up account
    //let resp = await db.query('select id from users where username=$1',[username]);
    //let user = resp.rows[0];
    const userid = await User.getId(username);
    let balance = await Account.getBalance(userid);
    //check balance against price
    if(balance < t.price){
        return next({
            status:400,
            message: 'Insufficient Funds'
        });
    }
    //adjust users account balance
    let result = await Account.purchase({id:userid,amount:t.total,balance:balance});
    //record the transaction
    if(result){
        let record = await Transaction.purchase({...t,id:userid});
        if(record){
            return res.status(201).json(record);
        }
    }
    

});

//ROUTE FOR SELLING STOCK
router.post(`/:username/sell/:symbol`, ensureCorrectUser, async function(req, res, next){
    let s = req.body;
    const username = req.params.username;
    //check that qty in object s is < 0;
    if(s.qty >= 0){
        return next({
            status:400,
            message:'quantity must be negative'
        })
    };
    const userId = await User.getId(username);
    console.log('selling using userid',userId);
    //verify that the user has that amount of stock to sell at that price
    let quantity = await Transaction.checkQuantity(s,userId);
    console.log('checking quantity', s.qty * -1, quantity);
    if(s.qty * -1 > quantity){
        return next({
            status:400,
            message:'Amount of shares exceeds currently held'
        })
    };
    //adjust users account balance
    let result = await Account.deposit(s,userId);
    if(result){
        let record = await Transaction.sell({...s,id:userId});
        if(record){
            return res.status(201).json(record);
        }
    }
})


module.exports = router;
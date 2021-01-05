const db = require('../db');

class Account{

    //get users account balance
    static async getBalance(userid){
        try{
            const result = await db.query(
                `SELECT * FROM accounts where user_id=$1`,
                [userid]
                );
                console.log('get balance result', result.rows);
                return result.rows[0].balance;
        }catch(err){
            console.log(err);
        }
        
    }

    //deduct amount from users account balance
    static async purchase(data){
        
        let newBalance = data.balance - data.amount;
        console.log('new balance',newBalance);
        console.log('id',data.id);
        const result = await db.query(
            `UPDATE accounts SET balance=$1 
            WHERE user_id=$2
            RETURNING id`,
            [newBalance,data.id]
        );
        if(result.rows[0]){
            return true;
        }
    }
    //add amount to users account balance
    static async deposit(sell,userid){
        //sell.qty is a negative integer
        const balance = await this.getBalance(userid);
        let newBalance = sell.qty * -1 * sell.currentPrice + balance;
        
        const result = await db.query(
            `UPDATE accounts SET balance=$1 
            WHERE user_id=$2
            RETURNING id`,
            [newBalance,userid]
        );
        if(result.rows[0]){
            return true;
        }
    }

    //add amount to users account balance when an option is successful
    static async depositOption(amount, userid){
        const balance = await this.getBalance(userid);
        let newBalance = amount * 2 + balance;
        try{
            const result = await db.query(
                `UPDATE accounts SET balance=$1 
                WHERE user_id=$2
                RETURNING id`,
                [newBalance,userid]
            );
            return result.rows[0];
        }catch(err){
            throw err;
        }

    }

}

module.exports = Account;
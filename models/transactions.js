const db = require('../db');

/**
 * Transactions table - keeps track of all stocks purchased and sold. Does
 * NOT include options.
 */

class Transaction{

    /** get all investments the user is currently holding*/
    static async getUserInvestments(userid){

        const result = await db.query(
            `SELECT stocks.symbol, transactions.price, stocks.name, SUM(qty) qty FROM transactions 
            INNER JOIN stocks ON transactions.symbol = stocks.symbol
            where user_id=$1 GROUP BY price, stocks.symbol HAVING sum(qty) > 0 `,[userid]
        );
        return result.rows;
    }
    //check that a user has that much stock to sell at that price
    static async checkQuantity(sell,userid){
        const result = await db.query(
            `SELECT SUM(qty) qty FROM transactions
            where user_id=$1 and symbol=$2 and price=$3`, 
            [userid, sell.symbol, sell.price]
        );
        return result.rows[0].qty;
    }

    //see history of a users sells and net gains
    static async getNetGains(userid){
        const result = await db.query(
            `SELECT symbol, 
            market_price * qty * -1 - price * qty * -1 as profit,
            price, market_price, qty * -1 as qty, EXTRACT (YEAR FROM t_date) as year,
            EXTRACT (MONTH FROM t_date) as MONTH, EXTRACT (DAY FROM t_date) as DAY
            FROM transactions where user_id=$1 and t_type=$2`,
            [userid,'sell']
        );
        return result.rows;
    }
    /**
     * purchase function checks to see if user invested at that price and symbol. if so then
     * the new transaction will record that investment as the parent. this way total
     * stocks held at that price can be a calculation. 
     */
    static async purchase(data){

            const result = await db.query(
                `INSERT INTO transactions
                (price, qty, total, symbol, user_id, t_type)
                VALUES ($1,$2,$3,$4,$5,$6) 
                RETURNING symbol, total, qty, price, id`,
                [data.price,data.qty,data.total,data.symbol,data.id,'purchase']
            );
            return result.rows[0];
    }

    //sell stock of a certain price
    static async sell(data){
        const result = await db.query(
            `INSERT INTO transactions
            (price, qty, total, symbol, user_id, t_type, market_price)
            VALUES ($1,$2,$3,$4,$5,$6, $7)
            RETURNING symbol, total, qty, price, id`,
            [data.price, data.qty, data.total, data.symbol, data.id,'sell', data.currentPrice]
        );
        return result.rows[0];
    }

}

module.exports = Transaction;
const db = require('../db');


class Stock{

    static async getAll(){

        const result = await db.query(
            `SELECT * FROM stocks
            ORDER BY symbol`
        );

        return result.rows;
        
    }

    static async search(term){
        const result = await db.query(
            `SELECT * FROM stocks
            WHERE name ILIKE $1`,[`%${term}%`]
        );
        return result.rows;
    }


    /**
     * 
     */
    static async addQuote(data){
        const result = await db.query(
            `INSERT INTO stock_quotes
            (price,price_open,high_day,low_day,previous_close,symbol)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING price, price_open,high_day,low_day,previous_close,symbol`,
            [data.c,data.o,data.h,data.l,data.pc,data.symbol]);
        return result.rows[0];
    }


}

module.exports = Stock;
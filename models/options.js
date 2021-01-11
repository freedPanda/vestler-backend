const db = require('../db');

/**
 * Options table - keeps track of both shorts and puts
 */

class Option{

    //get options that have not expired
    static async getUserPendingOptions(userid){

        try{
            const result = await db.query(
                `select * from options where user_id=$1 and completed=$2`,
                [userid,'false']
            );
            return result.rows;
        }catch(err){
            console.log(err);
            throw err;
        }

    }

    //get options that expired
    static async getExpiredOptions(userid){
        const d = new Date();
        const cDate = d.getTime();
        /*let cDate = d.getTime().toString();
        cDate = cDate.slice(0,10);
        cDate = Number(cDate);*/
        console.log('$$$$$ end date',cDate)

        try{
            const result = await db.query(
                `select * from options where user_id=$1 and completed=$2
                group by id
                having end_date < $3`,[userid,false,cDate]
            );
            if(result.rows.length < 1){
                return false;
            }
            return result.rows;
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    //get all options regardless of expiration
    static async getUserOptions(userid){
        try{
            const result = await db.query(
                `select * from options 
                where user_id=$1 
                order by end_date desc`,
                [userid]
            );
            return result.rows;
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    //get an option by option_id
    static async getOption(id){
        try{
            const result = await db.query(
                `select * from options where id = $1`,[id]
            );
            return result.rows[0];
        }catch(err){
            throw err;
        }
    }

    //insert a record into options table and record it as a put
    static async put(userid, option){
        let d = new Date();
        let p_date = d.getTime();
        const{amount,target,end_date,symbol} = option;

        try{
            const result = await db.query(`
            INSERT INTO options (amount, o_type, user_id, p_date, end_date, 
            completed, symbol, target)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [amount,'put',userid,p_date,end_date,false,symbol,target]);
            return result.rows[0];
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    //insert a record into options table and record it as a short
    static async short(userid, option){
        const{amount,target,end_date,symbol} = option;
        let d = new Date();
        let p_date = d.getTime();
        try{
            const result = await db.query(`
            INSERT INTO options (amount, o_type, target, user_id, p_date, 
                end_date, completed, symbol)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [amount,'short',target, userid, p_date,end_date,false,symbol]);
            return result.rows[0];
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    //update an option to completed status and update result_price
    static async update(data){
        try{
            const result = await db.query(`
            UPDATE options SET completed = $1, result_price = $2
            WHERE id=$3`,
            ['true',data.result_price,data.id]);
            return result.rows[0];
        }catch(err){
            console.log(err);
            throw err;
        }
    }

}
module.exports = Option;
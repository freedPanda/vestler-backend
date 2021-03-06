const db = require("../db");
const bcrypt = require("bcrypt");
const partialUpdate = require("../helpers/partialUpdate");
const fs = require('fs');


const BCRYPT_WORK_FACTOR = 10;


/** Related functions for users. */

class User {

  /** authenticate user with username, password. Returns user or throws err. */

  static async authenticate(data) {
    // try to find the user first
    const result = await db.query(
        `SELECT username, 
                password, 
                firstname, 
                lastname, 
                email
          FROM users 
          WHERE username = $1`,
        [data.username]
    );

    let user = result.rows[0];

    async function getFile(){
      let p = await fs.readFileSync(`./profilepics/${user.username}.jpeg`,
        async function read(err, data){
          if(err){console.log(err)};
          if(data){return data;};
        });
        return p.toString('utf-8');
    }

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(data.password, user.password);
      if (isValid) {

        user.photo = await getFile();
        user.stocks = [];
        return {...user};
      }
    }

    const invalidPass = new Error("Invalid Credentials");
    invalidPass.status = 401;
    throw invalidPass;
  }

  /** Register user with data. Returns new user data. */

  static async register(data) {
    const duplicateCheck = await db.query(
        `SELECT username 
            FROM users 
            WHERE username = $1`,
        [data.username]
    );

    if (duplicateCheck.rows[0]) {
      const err = new Error(
          `There already exists a user with username '${data.username}`);
      err.status = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
        `INSERT INTO users 
            (username, password, firstname, lastname, email) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING username, password, firstname, lastname, email`,
        [
          data.username,
          hashedPassword,
          data.firstname,
          data.lastname,
          data.email
        ]);

        let img = data.photo;
        fs.appendFile(`./profilepics/${data.username}.jpeg`,img,function(err){
            if(err) console.log('filereading',err)
        });
    const userid = await User.getId(result.rows[0].username);
    await db.query(`INSERT INTO ACCOUNTS (user_id) values ($1)`,[userid]);
    result.rows[0].photo = data.photo;
    return result.rows[0];
  }

  /** Find all users. */

  static async findAll() {
    const result = await db.query(
        `SELECT username, firstname, lastname, email
          FROM users
          ORDER BY username`);

    return result.rows;
  }

  /** Given a username, return data about user. */

  static async findOne(username) {
    const userRes = await db.query(
        `SELECT username, firstname, lastname, email 
            FROM users 
            WHERE username = $1`,
        [username]);

    const user = userRes.rows[0];

    if (!user) {
      const error = new Error(`There exists no user '${username}'`);
      error.status = 404;   // 404 NOT FOUND
      throw error;
    }
    return user;
  }

  /**GET USER ID WHEN PROVIDED USERNAME */
  static async getId(username){
    const res = await db.query(
      'SELECT id FROM users WHERE username=$1',[username]
    );
    console.log('getting userid',res.rows[0].id);
    return res.rows[0].id;
  }
  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Return data for changed user.
   *
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    let {query, values} = partialUpdate(
        "users",
        data,
        "username",
        username
    );

    const result = await db.query(query, values);
    const user = result.rows[0];

    if (!user) {
      let notFound = new Error(`There exists no user '${username}`);
      notFound.status = 404;
      throw notFound;
    }
    const applications = await db.query(
      `SELECT * FROM applications
      WHERE username = $1`,
      [user.username]
    );
    delete user.password;
    delete user.is_admin;
    
    return {...user,applications:applications.rows};

  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
      let result = await db.query(
              `DELETE FROM users 
                WHERE username = $1
                RETURNING username`,
              [username]);

    if (result.rows.length === 0) {
      let notFound = new Error(`There exists no user '${username}'`);
      notFound.status = 404;
      throw notFound;
    }
  }
}


module.exports = User;
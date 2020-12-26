/** Shared config for application; can be req'd many places. */


require("dotenv").config();

const SECRET = process.env.SECRET_KEY || 'bspkd2vrh5rehfh23ma0';

const PORT = process.env.PORT || 3001;
console.log(PORT);
// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'vestler-test'
// - else: 'vestler'

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "jobly-test";
} else {
  DB_URI  = process.env.DATABASE_URL || 'vestler';
}

console.log("Using database", DB_URI);

module.exports = {
  SECRET,
  PORT,
  DB_URI,
};
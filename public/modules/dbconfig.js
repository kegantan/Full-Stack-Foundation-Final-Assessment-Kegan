//Create a connection pool
var dbconfig =  {
    connectionLimit: 5, //Create a pool of 5 connections
    host: "127.0.0.1", //Local host DB
    user: "root",
    password: "tinpony58",
    database: "users"
};

module.exports = dbconfig;
const config = {
  databaseName: 'qp-db',
  dbuser: 'root',
  password: 'p@ssw0rd',
  dbconnection: {
    host: 'localhost',
    dialect: 'mysql'
  },
  jwtSecret: "myjwtsecret",
  port: 3000
}

module.exports = config;

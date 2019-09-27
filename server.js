const express = require('express');
const graphqlHTTP = require('express-graphql');

const app = express();
const schema = require('./schema.js');

app.use('/graphql', graphqlHTTP({
  schema, // for our data available to graphql
  graphiql: true,
}));

app.listen(4000);
console.log('Listening...');

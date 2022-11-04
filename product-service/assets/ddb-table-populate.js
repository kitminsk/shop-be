import { products } from "../data/products.js";
import { stocks } from "../data/stocks.js";

import AWS from 'aws-sdk';
AWS.config.update({region: 'us-east-1'});

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const productsTable = 'products';
const stocksTable = 'stocks';

products.forEach(postProduct);
stocks.forEach(postStock);

function postProduct (item) {
  let record = {
    'id' : {S: item.id},
    'title' : {S: item.title},
    'description' : {S: item.description},
    'price' : {N: item.price.toString()},
  }
  let data = {
    TableName: productsTable,
    Item: record,
  }
  ddb.putItem(data, function(err, data) {
    if (err) {
      console.log('Importing data Error', err);
    } else {
      console.log('Importing data Success', data);
    }
  });
}

function postStock (item) {
  let record = {
    'product_id' : {S: item.product_id},
    'count' : {N: item.count.toString()},
  }
  let data = {
    TableName: stocksTable,
    Item: record,
  }
  ddb.putItem(data, function(err, data) {
    if (err) {
      console.log('Importing data Error', err);
    } else {
      console.log('Importing data Success', data);
    }
  });
}


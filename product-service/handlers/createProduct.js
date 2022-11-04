import { cors } from "../data/cors.js";
import { ddbClient } from '../libs/db/ddbClient.js'

import AWS from 'aws-sdk';
import { PutItemCommand } from '@aws-sdk/client-dynamodb'

export async function createProduct(event) {
    console.log(`event: ${JSON.stringify(event)}`);

    const data = event.body;

    if (typeof data.title !== 'string') {
        console.error('Validation Failed');
        callback(null, {
            statusCode: 400,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t create the Product item.',
        });
        return;
    }

    const id = AWS.util.uuid.v4();
    const paramsProduct = {
        TableName: process.env.TABLE_PRODUCTS,
        Item: {
            id: { S: id },
            title: { S: data.title },
            description: { S: data.description },
            price: { N: data.price.toString() },
        }
    }
    const paramsStock = {
        TableName: process.env.TABLE_STOCKS,
        Item: {
            product_id: { S: id },
            count: { N: data.count.toString()},
        }
    }

    try {
        await ddbClient.send(new PutItemCommand(paramsProduct));
        await ddbClient.send(new PutItemCommand(paramsStock));

        return {
            statusCode: 200,
            headers: { ...cors },
            body: JSON.stringify({ ...paramsProduct.Item, count: paramsStock.Item.count })
        }
    } catch (error) {
        return {
            statusCode: 400,
            headers: { ...cors },
            body: JSON.stringify(error.message)
        }
    }

}

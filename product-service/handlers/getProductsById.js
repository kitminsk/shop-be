import { cors } from "../data/cors.js";

import AWS from "aws-sdk";

const ddb = new AWS.DynamoDB.DocumentClient();

const scan = async(params) => {
    const response = await ddb.scan(params, function ( err, data) {
        if (err) {
            return {
                statusCode: 200,
                headers: { ...cors },
                body: JSON.stringify({
                    message: err.message,
                }),
            };
        }
    }).promise();
    return response.Items;
};

export async function getProductsById(event) {
    console.log(`event: ${JSON.stringify(event)}`);

    const { pathParameters } = event;
    const productId = pathParameters.id;

    if (!productId) {
        return {
            statusCode: 400,
            headers: { ...cors },
            body: JSON.stringify({
                message: "Product id was not provided or has a wrong type",
            }),
        };
    }

    const productTableParams = {
        TableName: process.env.TABLE_PRODUCTS,
        FilterExpression: 'id = :id',
        ExpressionAttributeValues: {':id': productId}
    }
    const products = await scan(productTableParams);
    if (typeof products[0] == 'undefined') {
        return {
            statusCode: 404,
            headers: { ...cors },
            body: JSON.stringify({
                message: "Product Not Found",
            }),
        };
    }
    const product = products[0];
    product.count = 0;

    const stockTableParams = {
        TableName: process.env.TABLE_STOCKS,
        FilterExpression: 'product_id = :id',
        ExpressionAttributeValues: {':id': productId}
    }
    const stocks = await scan(stockTableParams);
    if (typeof stocks[0].count !== 'undefined') {
        product.count = stocks[0].count;
    }

    return {
        statusCode: 200,
        headers: { ...cors },
        body: JSON.stringify(product),
    };

}

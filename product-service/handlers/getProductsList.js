import { cors } from "../data/cors.js";
import AWS from "aws-sdk";

const ddb = new AWS.DynamoDB.DocumentClient();

const scan = async(params) => {
    const response = await ddb.scan(params).promise();
    return response.Items;
};

const productTableParams = {
    TableName: process.env.TABLE_PRODUCTS
}

const stockTableParams = {
    TableName: process.env.TABLE_STOCKS
}

export async function getProductsList(event) {
    console.log(`event: ${JSON.stringify(event)}`);

    const products = await scan(productTableParams);
    const stocks = await scan(stockTableParams);

    const result = products.map((product) => {
        const stock = stocks.find((st) => st.product_id == product.id);
        if (stock) {
            product.count = stock.count
        }
        return product;
    });

    return {
        statusCode: 200,
        headers: { ...cors },
        body: JSON.stringify(result),
    };
}

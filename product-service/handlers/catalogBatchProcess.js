import AWS from "aws-sdk";
import {ddbClient} from "../libs/db/ddbClient.js";
import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import {cors} from "../data/cors.js";
const REGION = "us-east-1";
const snsClient = new SNSClient({ region: REGION });

export async function catalogBatchProcess(event) {
    console.log(`event: ${JSON.stringify(event)}`);
    const batchProducts = [];
    try {
        for (const {body} of event.Records) {
            const product = JSON.parse(body);

            const id = AWS.util.uuid.v4();
            const paramsProduct = {
                TableName: process.env.TABLE_PRODUCTS,
                Item: {
                    id: { S: id },
                    title: { S: product.title },
                    description: { S: product.description },
                    price: { N: product.price },
                }
            }
            const paramsStock = {
                TableName: process.env.TABLE_STOCKS,
                Item: {
                    product_id: { S: id },
                    count: { N: product.count},
                }
            }
            await ddbClient.send(new PutItemCommand(paramsProduct));
            await ddbClient.send(new PutItemCommand(paramsStock));

            batchProducts.push(product.title);
        }
    } catch (error) {
        console.log(error.message)
    }

    const snsParams = {
        Message: `Following products were created. ${JSON.stringify(batchProducts)}`,
        TopicArn: process.env.SNS_TOPIC
    };

    try {
        await snsClient.send(new PublishCommand(snsParams));
    } catch(error) {
        console.error('Error sending email', error.message);
    }

    return {
        statusCode: 200,
        headers: {...cors},
        body: JSON.stringify('catalogBatchProcess executed successfully')
    };
}

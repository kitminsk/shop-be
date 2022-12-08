import { cors } from "../data/cors.js";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3 } from '@aws-sdk/client-s3';
const S3Client = new S3({region: 'us-east-1'});
import { GetObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = 'node-in-aws-s3-task5-dzianis';

export async function importProductsFile(event) {
    console.log(`event: ${JSON.stringify(event)}`);
    const { queryStringParameters } = event
    const { name } = queryStringParameters || {}

    let headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
    };

    try {
        if (!name) {
            return {
                statusCode: 400,
                headers: { ...cors },
                body: JSON.stringify('Name parameter is wrong'),
            };
        }

        const params = {
            Bucket: BUCKET,
            Key: `uploaded/${name}`,
        };

        const command = new GetObjectCommand(params)
        const signedUrl = await getSignedUrl(S3Client, command, { expiresIn: 3600 })

        return {
            statusCode: 200,
            headers: headers,
            body: signedUrl,
        };
    } catch (error) {
        return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify(error.message),
        };
    }

}

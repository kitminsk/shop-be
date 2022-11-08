import { cors } from '../data/cors.js';
import { S3 } from '@aws-sdk/client-s3';
const S3Client = new S3({region: 'us-east-1'});
import csvParser from 'csv-parser';

const BUCKET = 'node-in-aws-s3-task5-dzianis';

export async function importFileParser(event) {
    console.log(`event: ${JSON.stringify(event)}`);

    try {
        //uploaded/products.csv
        const { key } = event.Records[0].s3.object;
        const params = {
            Bucket: BUCKET,
            Key: key,
        }

        const {Body} = await S3Client.getObject(params);

        let results = [];
        Body
            .pipe(csvParser())
            .on('data', (data) => {
                results.push(data)
            })
            .on('error', (error) => {
                console.log(error);
            })
            .on('end', () => console.log('Parsing is completed'));

        results.forEach(item => console.log(item))

        return {
            statusCode: 202,
        };
    }
    catch (error) {
        return {
            statusCode: 200,
            headers: { ...cors },
            body: JSON.stringify(error.message),
        };
    }
}

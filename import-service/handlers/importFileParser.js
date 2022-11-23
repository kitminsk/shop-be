import AWS from 'aws-sdk';
import { S3 , CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
const S3Client = new S3({region: 'us-east-1'});

import  { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const sqsClient = new SQSClient({region: 'us-east-1'});

import csvParser from 'csv-parser';

const publish = async (data) => {
    const params = {
        MessageBody: JSON.stringify(data),
        QueueUrl: process.env.SQS_URL,
        MessageGroupId: 'catalogItemsQueue',
        MessageDeduplicationId: AWS.util.uuid.v4()
    }
    await sqsClient.send(new SendMessageCommand(params));
}

export async function importFileParser(event) {
    console.log(`event: ${JSON.stringify(event)}`);
    try {
        //uploaded/products.csv
        const { key } = event.Records[0].s3.object;
        const copyKey = key.replace('uploaded', 'parsed')
        const params = {
            Bucket: process.env.BUCKET,
            Key: key,
        }
        const copyParams ={
            Bucket: process.env.BUCKET,
            CopySource: process.env.BUCKET + '/' + key,
            Key: copyKey,
        }
        const {Body} = await S3Client.getObject(params);

        Body
            .pipe(csvParser())
            .on('data', (data) => {
                publish(data)
            })
            .on('error', (error) => console.log(error))
            .on('end', () => console.log('Parsing is completed'));

        // S3: Copy file.
        const copyResponse = await S3Client.send(new CopyObjectCommand(copyParams))
        console.log('copy response: ', copyResponse )

        // S3: Delete file.
        const deleteResponse = await S3Client.send(new DeleteObjectCommand(params))
        console.log('delete response: ', deleteResponse)
    }
    catch (error) {
        console.error('Error: ' + error.message)
    }
}

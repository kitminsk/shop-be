
module.exports = async (event, context, callback) => {
    console.log(`event: ${JSON.stringify(event)}`);

    if (event.type !== 'TOKEN') {
        callback('Unauthorized');
        return;
    }

    try {
        const encodedCreds = event.authorizationToken.split(' ')[1];
        const buff = Buffer.from(encodedCreds, 'base64');
        const plainTextCreds = buff.toString('utf-8').split(':');
        const username = plainTextCreds[0];
        const password = plainTextCreds[1];

        console.log('username ' + username);
        console.log('password ' + password);

        let effect = 'Deny';
        if (
            username === process.env.AUTH_USERNAME &&
            password === process.env.AUTH_PASSWORD
        ) {
            effect = 'Allow';
        }

        callback(null, generatePolicy('user', effect, event.methodArn));
    }
    catch (error) {
        callback(`Unauthorized: ${error.message}`);
    }
}

const generatePolicy = (principalId, effect, resource) => {
    return {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource
                }
            ]
        }
    }
}

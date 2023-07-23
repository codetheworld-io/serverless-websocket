import { ApiGatewayManagementApi, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@libs/dynamodb-doc-client';
import { ServiceException } from '@smithy/smithy-client/dist-types/exceptions';
import { APIGatewayProxyHandler } from 'aws-lambda';
import process from 'process';

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const { Items } = await docClient.send(
      new ScanCommand({ TableName: process.env.CONNECTIONS_TABLE_NAME }),
    );

    const endpoint = process.env.IS_OFFLINE === 'true'
      ? 'http://localhost:3001'
      : process.env.WEBSOCKET_ENDPOINT;
    const apiGatewayManagementApi = new ApiGatewayManagementApi({ endpoint });
    await Promise.allSettled(
      Items.map((item) => {
        return apiGatewayManagementApi.send(new PostToConnectionCommand({
          ConnectionId: item.id,
          Data: event.body,
        })).catch((e: ServiceException) => {
          if (e.$metadata.httpStatusCode === 410) {
            return docClient.send(new DeleteCommand({
              TableName: process.env.CONNECTIONS_TABLE_NAME,
              Key: { id: item.id }
            }));
          }

          throw e;
        });
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Done' }),
    };
  } catch (e) {
    console.error(e);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: (e as Error).message }),
    };
  }
};

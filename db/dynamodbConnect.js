const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();

let dynamodbInstance = null;

function dynamodbConnect() {
  try {
    if (!dynamodbInstance) {
      dynamodbInstance = new DynamoDBClient({
        region: process.env.AWS_REGION, // Replace with your desired AWS region
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Replace with your AWS access key ID
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Replace with your AWS secret access key
        },
      });
      console.log("Successfully connected to DynamoDB")
    }
  } catch (error) {
    console.log(error);
  }
  
  return dynamodbInstance;
}

module.exports = dynamodbConnect;


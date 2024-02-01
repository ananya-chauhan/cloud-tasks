const functions = require('@google-cloud/functions-framework');
const { MongoClient } = require('mongodb');
const {SecretManager} = require('./serviceManager')

const sm = new SecretManager();
 
const mongoSecretName = 'test-gor-mongo-connection-uri';
 
exports.processOrder = functions.http(async (req, res) => {
  try {
    ;

    const base64EncodedString = req.body;

    
    const decodedString = Buffer.from(base64EncodedString, 'base64').toString('utf-8');

    
    const payload = JSON.parse(decodedString);
 
    
    if (!orderReferenceId || !nextStatus) {
      console.error('Invalid request. Missing orderReferenceId or nextStatus.');
      return res.status(200).send('Invalid request.');
    }
    
    const mongoUri = await sm.getSecret(mongoSecretName);
    
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
 
    
    const database = client.db('admin');
    const ordersCollection = database.collection('orders');
    const bcpReportCollection = database.collection('bcpReport');
 
    
 
    const orderDoc = await ordersCollection.findOne({ referenceId: orderReferenceId, "orderHistory.internalStatus": nextStatus });
 
    
    if (!orderDoc) {
      const order = await ordersCollection.findOne({referenceId:orderReferenceId});
      if(!order){
        console.error(`Order document with ID ${orderReferenceId} not found.`);
        return res.status(200).send('Order document not found.');
      }
      await bcpReportCollection.insertOne(order);
    }
   
    await client.close();
 
    return res.status(200).send('Success');
  } catch (error) {
    console.error('Error processing order:', error);
    return res.status(200).send('Internal server error.');
  }
});



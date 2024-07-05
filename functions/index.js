const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendOrderNotification = functions.firestore.document('pesanan/{orderId}')
  .onCreate(async (snap, context) => {
    const newOrder = snap.data();

    const payload = {
      notification: {
        title: 'New Order Received',
        body: `Order ID: ${context.params.orderId}`
      }
    };

    try {
      await admin.messaging().sendToTopic('newOrders', payload);
      console.log('Successfully sent message');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

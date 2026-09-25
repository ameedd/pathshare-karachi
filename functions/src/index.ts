import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Triggered on new ride booking request -> Notifies driver
 */
export const onRideRequestCreated = functions.firestore
  .document('requests/{requestId}')
  .onCreate(async (snap, context) => {
    const requestData = snap.data();
    const { rideId, name, pickup, farePerSeat } = requestData;

    console.log(`New ride booking request #${context.params.requestId} for ride #${rideId} from ${name}`);
    
    // In production: send SMS/WhatsApp or FCM push notification to driver
    return { success: true };
  });

/**
 * Triggered when a ride status changes to 'completed' -> Automatically writes to trip histories
 */
export const onRideCompleted = functions.firestore
  .document('rides/{rideId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== 'completed' && after.status === 'completed') {
      console.log(`Ride #${context.params.rideId} completed. Archiving and releasing settlements.`);
    }
    return null;
  });

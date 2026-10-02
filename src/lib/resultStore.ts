// src/lib/resultStore.ts
// Token generation and persistence for shareable, revocable results.
//
// DESIGN PRINCIPLES:
// 1. Privacy & Security: The URL token is the ONLY credential. It is generated using
//    cryptographically secure random bytes. Results contain no raw resume text or PII.
// 2. Ephemeral Storage: All records are stamped with an `expiresAt` date (30 days)
//    to integrate with Firestore TTL policies for automatic hard deletion.
// 3. Complete Revocation: Users must be able to manually trigger a hard delete of their
//    data at any time using their token.

import * as admin from 'firebase-admin';
import { randomBytes } from 'crypto';
import type { ScanResult } from '@/types';

// Safely initialize Firebase Admin for serverless environments
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newline characters from environment variables
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('[ResultStore] Firebase Admin initialization error:', error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;
const COLLECTION_NAME = 'scan_results';

/**
 * Generates a secure token and saves the anonymized scan result to the database.
 * 
 * @param result The processed ScanResult object (must be pre-stripped of PII)
 * @returns The secure hex token used to retrieve the result
 */
export async function saveResult(result: ScanResult): Promise<string> {
  if (!db) {
    throw new Error('Database connection is not initialized. Cannot save result.');
  }

  // Generate a cryptographically secure 32-character hex string token
  const token = randomBytes(16).toString('hex');
  
  // Set an explicit expiration date 30 days in the future
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.collection(COLLECTION_NAME).doc(token).set({
    ...result,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
  });

  return token;
}

/**
 * Retrieves a scan result by its secure token. 
 * Automatically enforces expiration even if the Firestore TTL job is delayed.
 * 
 * @param token The 32-character hex token
 * @returns The ScanResult object, or null if expired/not found
 */
export async function getResult(token: string): Promise<ScanResult | null> {
  if (!db || !token || typeof token !== 'string') return null;

  try {
    const doc = await db.collection(COLLECTION_NAME).doc(token).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    
    // Failsafe: Enforce expiration at read-time in case the background TTL sweeper is lagging
    if (data?.expiresAt && data.expiresAt.toDate() < new Date()) {
      return null;
    }

    // Strip out database-specific metadata before returning to the client
    const { createdAt, expiresAt, ...safeResult } = data as any;
    return safeResult as ScanResult;
  } catch (error) {
    console.error(`[ResultStore] Failed to retrieve token ${token}:`, error);
    return null;
  }
}

/**
 * Permanently revokes (hard deletes) a scan result from the database.
 * 
 * @param token The 32-character hex token
 * @returns boolean indicating success or failure
 */
export async function deleteResult(token: string): Promise<boolean> {
  if (!db || !token || typeof token !== 'string') return false;
  
  try {
    await db.collection(COLLECTION_NAME).doc(token).delete();
    return true;
  } catch (error) {
    console.error(`[ResultStore] Failed to delete token ${token}:`, error);
    return false;
  }
}
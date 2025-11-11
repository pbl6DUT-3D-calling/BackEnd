// const admin = require("firebase-admin");
// require("dotenv").config();

// // Load service account key from environment variables
// const serviceAccount = {
//   type: process.env.FIREBASE_TYPE,
//   project_id: process.env.FIREBASE_PROJECT_ID,
//   private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//   private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//   client_email: process.env.FIREBASE_CLIENT_EMAIL,
//   client_id: process.env.FIREBASE_CLIENT_ID,
//   auth_uri: process.env.FIREBASE_AUTH_URI,
//   token_uri: process.env.FIREBASE_TOKEN_URI,
//   auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//   client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
// };

// // Initialize Firebase Admin SDK
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// module.exports = { admin };


// Nhập thư viện firebase-admin
const admin = require("firebase-admin");

// Nhập file service account key (chính là file pbl6.json của bạn)
const serviceAccount = require("../../pbl6.json");

// Lấy URL bucket của bạn từ bước 1 (thay thế bằng URL của bạn)
const BUCKET_URL = "gs://ahrumiki.firebasestorage.app"; // <-- THAY THẾ BẰNG URL BUCKET CỦA BẠN

// Khởi tạo ứng dụng Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: BUCKET_URL 
});

// Lấy một tham chiếu (reference) đến bucket
const bucket = admin.storage().bucket();

// Xuất (export) bucket để các file khác trong dự án có thể sử dụng
module.exports = {
  bucket
};
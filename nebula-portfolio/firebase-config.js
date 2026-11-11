// Isi dengan konfigurasi Web App dari Firebase Console.
// Konfigurasi Firebase untuk web bukan password rahasia; keamanan tetap wajib memakai Firestore Rules.
export const firebaseConfig = {
  apiKey: "AIzaSyDnuKjApZDjj_l2fr7G0ua0O0O9f9haWiU",
  authDomain: "web-message-portfolio.firebaseapp.com",
  projectId: "web-message-portfolio",
  storageBucket: "web-message-portfolio.firebasestorage.app",
  messagingSenderId: "760403022761",
  appId: "1:760403022761:web:1782abbe98a607135a6ab8",
};

// Setelah membuat akun admin di Firebase Authentication, salin UID-nya ke sini.
// UID yang sama juga harus dipasang di firestore.rules.
export const ADMIN_UID = "BONgnK356QTKSzq2PvHrZx44NEN2";

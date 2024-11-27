import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBo9ncb-ZhO9dxUH-ziLQw50h2G_Nw70dA",
  authDomain: "solana-udpm-9.firebaseapp.com",
  projectId: "solana-udpm-9",
  storageBucket: "solana-udpm-9.firebasestorage.app",
  messagingSenderId: "777400816994",
  appId: "1:777400816994:web:27441bad8e6fe02d31883b",
  measurementId: "G-9E1E60G8J1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app); // Đảm bảo Analytics đã được khởi tạo đúng

export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return user;
  } catch (error) {
    console.error("Lỗi đăng nhập Google", error);
    return null;
  }
};

import firebase from "firebase/app"
import {getAuth} from "firebase/auth"
import "firebase/database"
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIzaSyBpt_tid__3KJki11dkg3OGzOjwldcdkOc",
  authDomain: "community4u-1a242.firebaseapp.com",
  projectId: "community4u-1a242",
  storageBucket: "community4u-1a242.appspot.com",
  messagingSenderId: "381627307814",
  appId: "1:381627307814:web:bfd9d5505718be17eb13e7"
};
  const app = initializeApp(firebaseConfig);

  export const auth = getAuth(app);
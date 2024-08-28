// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBmNJNRtzQ9bhys9In1DWDUSA3pU7Q57Zo",
//   authDomain: "reviewdashboard-19bdc.firebaseapp.com",
//   projectId: "reviewdashboard-19bdc",
//   storageBucket: "reviewdashboard-19bdc.appspot.com",
//   messagingSenderId: "589749270522",
//   appId: "1:589749270522:web:dba3c0928664eb037bd643",
//   measurementId: "G-M75BB1H8LV"
// };

const firebaseConfig = {

  apiKey: "AIzaSyCnzqplYe1zuVwulDDtLMWg88gJieH1AcI",

  authDomain: "reviewdashboard-3c3eb.firebaseapp.com",

  projectId: "reviewdashboard-3c3eb",

  storageBucket: "reviewdashboard-3c3eb.appspot.com",

  messagingSenderId: "1016542396233",

  appId: "1:1016542396233:web:455b6f360f60d9ba69e498",

  measurementId: "G-YJ2EW6Q93N"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);


export { db, collection, addDoc, storage, ref, uploadBytes, getDownloadURL };


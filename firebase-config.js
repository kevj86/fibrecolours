import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"

const app = initializeApp({
  apiKey: "AIzaSyDk2h79h-nFoAHh23zX6Bv3pZ3DZ3OaqbY",
  authDomain: "fibre-b9004.firebaseapp.com",
  databaseURL: "https://fibre-b9004-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "fibre-b9004",
  storageBucket: "fibre-b9004.appspot.com",
  messagingSenderId: "606131932751",
  appId: "1:606131932751:web:207f2c821d75dc9aa2243a",
})

export const database = getDatabase(app)
export const auth = getAuth(app)

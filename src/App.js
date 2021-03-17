import './App.css';
import styled, { keyframes } from 'styled-components'
import Dashboard from './Dashboard'
import SignIn from './SignIn'
import SignOut from './SignOut'

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { ToastProvider } from 'react-toast-notifications'

import { useAuthState } from 'react-firebase-hooks/auth'

console.log("****")
console.log(firebase)
if (!firebase.apps.length) {
  console.log('WOAH')
  console.log(firebase)
  firebase.initializeApp({
    apiKey: "AIzaSyD8J1dIzHEI0oVK6xIYWzibFT0aVyC0k7g",
    authDomain: "pix-place.firebaseapp.com",
    projectId: "pix-place",
    storageBucket: "pix-place.appspot.com",
    messagingSenderId: "106277400478",
    appId: "1:106277400478:web:c62bc4f8a5850332a7308f",
    measurementId: "G-6P2NSL7F7V"
  })
} else {
  firebase.app()
}

export const auth = firebase.auth()

const ocean = keyframes`
  0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`

const FullScreen = styled.div`
  height: 100vh;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
	animation: ${ocean} 15s ease infinite;
  display: flex;
  justify-content: center;
  align-items: center;
`

function App() {

  const [user] = useAuthState(auth)

  return (
    <ToastProvider>
      <FullScreen>
        {/* <SignOut /> */}
        {user ? <Dashboard /> : <SignIn />}
      </FullScreen>
    </ToastProvider>
  );
}

export default App;

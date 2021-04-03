import { auth } from './App'
import styled from 'styled-components'
import firebase from 'firebase'
import { GlassPanel } from './styles'
import googleButton from './images/btn_google_signin_light_normal_web@2x.png'

const CenteredPanel = styled(GlassPanel)`
  width: 400px;
  height: 200px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
  font-weight: 100;
  font-family: sans-serif;
  h3 {
    font-weight: 100;
  }
  .title {
    margin-bottom: 30px;
    font-size: 16px;
    font-weight: 200;
    font-family: sans-serif;
  }
  img {
    width: 200px;
    cursor: pointer;
  }
`

export default function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  
  return (
    <CenteredPanel>
      <h3>Niles & Shrine Present Picture Ping Pong Results</h3>
      <div className="title">Sign In to the Pix Place</div>
      <img
        onClick={signInWithGoogle}
        src={googleButton}
        alt="Google Sign In Button" />
    </CenteredPanel>
  )
}
  
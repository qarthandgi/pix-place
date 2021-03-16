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
  .title {
    margin-bottom: 30px;
    font-size: 20px;
    font-weight: bold;
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
      <div className="title">Sign In to the Pix Place</div>
      <img
        onClick={signInWithGoogle}
        src={googleButton}
        alt="Google Sign In Button" />
    </CenteredPanel>
  )
}
  
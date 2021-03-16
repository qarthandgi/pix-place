import { auth } from './App'

export default function SignOut() {
  return auth.currentUser && (
      <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}
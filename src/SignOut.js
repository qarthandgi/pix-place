import { auth } from './App'

export default function SignOut({className}) {
  return auth.currentUser && (
      <button className={className} onClick={() => auth.signOut()}>Sign Out</button>
  )
}
import styled from 'styled-components'
import { GlassPanel } from './styles'
import Webcam from 'webcam-easy'
import { useEffect, useState } from 'react'
import firebase from 'firebase'
import { v4 as uuidv4 } from 'uuid'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { auth } from './App'
import PostsHistory from './PostsHistory'

const DashboardPane = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    margin: 20px;
    .staging {
        flex: 3;
        display: flex;
        justify-content: center;
        height: 100%;
        flex-flow: column nowrap;
        align-items: center;
    }
    aside {
        flex: 1;
        height: 100%;
    }
`

const ViewerPane = styled(GlassPanel)`
    width: 640px;
    height: 480px;
    margin: 0 80px;
    position: relative;
`

const Capture = styled(GlassPanel)`
    width: 80px;
    height: 80px;
    cursor: pointer;
    align-self: center;
    margin-top: 50px;
    position: relative;
    border-radius: 50%;
    &:after {
        content: "";
        position: absolute;
        top: 8px;
        right: 8px;
        bottom: 8px;
        left: 8px;
        transition: all 20ms linear;
        background-color: red;
        border-radius: 50%;

    }
    &:hover {
        &:after {
            top: 6px;
            right: 6px;
            bottom: 6px;
            left: 6px;
            transition: all 10ms linear;
        }
    }
`




export default function Dashboard(props) {
    const firestore = firebase.firestore()

    const storageRef = firebase.storage().ref()
    
    let [webcam, setWebcam] = useState(null)
    // let webcam = null

    const postsRef = firestore.collection('posts')
    const postsRefQuery = postsRef.orderBy('createdAt').limit(25)
    const [posts] = useCollectionData(postsRefQuery, {idField: 'id'})

    const snapshot = () => {
        console.log(webcam)
        const picture = webcam.snap()
        console.log(picture)
        const fileString = `uploads/${uuidv4()}.png`
        const imageRef = storageRef.child(fileString)
        imageRef.putString(picture, 'data_url').then(async (snapshot) => {
            console.log('uploaded')
            console.log(snapshot)
            // const pictureUrl = `https://${snapshot.ref._delegate._location.bucket}/${snapshot.ref._delegate._location.path_}`
            const pictureUrl = await snapshot.ref.getDownloadURL()

            const { uid, photoURL, displayName } = auth.currentUser;
            console.log(auth.currentUser)
            console.log(uid, photoURL)

            await postsRef.add({
                uid,
                profileName: displayName,
                profileImageUrl: photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                pictureUrl
            })

        })
    }
    
    useEffect(() => {
        console.log('ok running once')
        console.log(document.getElementById('webcam'))
        const webcamElement = document.getElementById('webcam')
        const canvasElement = document.getElementById('canvas')
        const snapSoundElement = document.getElementById('snapSound')
        const webcamInstance = new Webcam(webcamElement, 'user', canvasElement)
        webcamInstance.start()
            .then(result => {
                console.log(result)
                console.log('webcam started')
                setWebcam(webcamInstance)
            }).catch(err => {
                console.log('Permission not granted')
            })
    }, [])
    return (
        <DashboardPane>
            <div className="staging">
                <ViewerPane>
                    <video src="" id="webcam" autoPlay playsInline width="640" height="480"></video>
                    <canvas id="canvas" style={{display: 'none'}}></canvas>
                    <audio src="audio/snap.wav" id="snapSound" preload="auto"></audio>
                </ViewerPane>
                <Capture className="hello" onClick={snapshot} />
            </div>
            <PostsHistory />
            {/* <aside>
                {posts && posts.map(x => <div key={x.id} ><img src={x.pictureUrl} alt=""/></div>)}
            </aside> */}
        </DashboardPane>
    )
}
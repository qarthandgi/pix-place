import styled from 'styled-components'
import firebase from 'firebase'
import * as faceapi from 'face-api.js'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Webcam from 'webcam-easy'

import { auth } from './App'
import { GlassPanel } from './styles'

const StyledCaptureDashboard = styled.div`
    display: flex;
    flex-flow: column nowrap;
    align-items: cneter;
    height: 100%;
    justify-content: center;
    flex: 3;
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

const getExpression = async (image) => {
    const detection = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
    if (!detection) {
        console.log('Could not detect face.')
        return null
    } else {
        const expressions = []
        for (const prop in detection.expressions) {
            if (detection.expressions.hasOwnProperty(prop)) {
                expressions.push({
                    emotion: prop,
                    value: detection.expressions[prop]
                })
            }
        }
        expressions.sort((a, b) => b.value - a.value)
        console.log(expressions)
        return expressions[0]
    }
}

export default function CaptureDashboard(props) {
    // Reference to firestore & storage items we'll need
    const postsReference = firebase.firestore().collection('posts')
    const uploadsBucketReference = firebase.storage().ref()

    // Load the models for the Face Expression Detection
    useEffect(async () => {
        await faceapi.loadFaceExpressionModel('/weights')
        await faceapi.loadTinyFaceDetectorModel('/weights')
    }, [])

    // Ready the webcam
    const [webcam, setWebcam] = useState(null)
    useEffect(() => {
        const webcamElement = document.getElementById('webcam')
        const canvasElement = document.getElementById('canvas')
        const webcamInstance = new Webcam(webcamElement, 'user', canvasElement)
        webcamInstance.start()
            .then(result => {
                console.log('Webcam started')
                setWebcam(webcamInstance)
            }).catch(err => {
                console.log('Permission not granted')
            })
    }, [])

    const snapshot = async () => {
        const picture = webcam.snap()
        const image = new Image()
        image.src = picture
        const expression = await getExpression(image)

        const uploadPath = `uploads/${uuidv4()}.png`
        const imageRef = uploadsBucketReference.child(uploadPath)
        imageRef.putString(picture, 'data_url').then(async (snapshot) => {
            const pictureUrl = await snapshot.ref.getDownloadURL()
            const { uid, photoURL, displayName } = auth.currentUser;
            await postsReference.add({
                uid,
                profileName: displayName,
                profileImageUrl: photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                pictureUrl,
                expression: expression && expression.emotion
            })
        })
    }

    return (
        <StyledCaptureDashboard>
            <ViewerPane>
                <video src="" id="webcam" autoPlay playsInline width="640" height="480"></video>
                <canvas id="canvas" style={{display: 'none'}}></canvas>
                <audio src="audio/snap.wav" id="snapSound" preload="auto"></audio>
            </ViewerPane>
            <Capture className="hello" onClick={snapshot} />
        </StyledCaptureDashboard>
    )
}
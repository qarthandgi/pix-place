import styled from 'styled-components'
import firebase from 'firebase'
import * as faceapi from 'face-api.js'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Webcam from 'webcam-easy'
import { useToasts } from 'react-toast-notifications'

import { auth } from './App'
import { GlassPanel } from './styles'

const StyledCaptureDashboard = styled.div`
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
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
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 700;
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
        z-index: -1;

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

// Ideally should turn this into a hook: `useExpression...`
const getExpression = async (image) => {
    const detection = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
    if (!detection) {
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
        return expressions[0]
    }
}

export default function CaptureDashboard() {
    const { addToast } = useToasts()
    
    // Reference to firestore & storage items we'll need
    const postsReference = firebase.firestore().collection('posts')
    const uploadsBucketReference = firebase.storage().ref()

    // Load the models for the Face Expression Detection
    useEffect(async () => {
        const detectionModel = await faceapi.loadTinyFaceDetectorModel('/weights')
        const weightsExpression = await faceapi.loadFaceExpressionModel('/weights')
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

    const snapshot = async (won) => {
        addToast('Detecting expression & posting photo.', { appearance: 'info', autoDismiss: true })
        const picture = webcam.snap()
        const image = new Image()
        image.src = picture
        const expression = await getExpression(image)

        if (!expression) {
            addToast('Expression not detected, uploading anyway.', { appearance: 'warning', autoDismiss: true })
        } else {
            addToast(`I see that you're feeling ${expression.emotion}. Alright, uploading!`, { appearance: 'success', autoDismiss: true })
        }

        const uploadPath = `uploads/${uuidv4()}.png`
        const imageRef = uploadsBucketReference.child(uploadPath)
        imageRef.putString(picture, 'data_url').then(async (snapshot) => {
            const pictureUrl = await snapshot.ref.getDownloadURL()
            const { uid, photoURL, displayName } = auth.currentUser;
            await postsReference.add({
                uid,
                won,
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
            <Capture onClick={() => snapshot(true)}>I WON!</Capture>
            <Capture onClick={() => snapshot(false)}>I LOST!</Capture>
        </StyledCaptureDashboard>
    )
}
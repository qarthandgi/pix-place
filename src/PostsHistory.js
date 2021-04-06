import styled from 'styled-components'
import firebase from 'firebase'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useEffect, useRef, useState } from 'react'

import { GlassPanel } from './styles'
import Post from './Post'

const StyledHistoryPanel = styled(GlassPanel)`
    height: 100%;
    overflow: hidden;
    width: 400px;
    .leaderboard {
        height: 20%;
        padding: 20px;
        /* border-bottom: 1px lightgray solid; */
        box-shadow: 0 0 8px 1px black;
        /* background-color: blue; */
    }
    .container {
        width: 100%;
        height: 80%;
        overflow: scroll;
        display: flex;
        flex-flow: column;
        .space {
            flex: 1;
        }
    }
`

const StyledEntry = styled.div`
    display: flex;
    justify-content: space-between;
`

export default function PostsHistory() {

    // Get firestore instance, prepare the firestore query, and initiate data
    const firestore = firebase.firestore()
    const postsRef = firestore.collection('posts')
    const postsRefQuery = postsRef.orderBy('createdAt').limit(25)
    const [posts] = useCollectionData(postsRefQuery, {idField: 'id'})
    const [leaderboard, setLeaderboard] = useState([])

    useEffect(() => {
        // const allPosts = []
        // posts.forEach((doc) => {
        //     allPosts.push(doc.data())
        // })
        console.log(posts)
        if (!posts) {
            return
        }
        const results = posts.reduce((acc, current) => {
            if (!current.won) {
                return acc
            }
            if (acc[current.uid]) {
                acc[current.uid].score = acc[current.uid].score + 1
            } else {
                acc[current.uid] = {
                    score: 1,
                    profileImageUrl: current.profileImageUrl,
                    profileName: current.profileName
                }
            }
            return acc
        }, {})
        const resultsArr = Object.keys(results).map(key => {
            return {
                uid: key,
                ...results[key]
            }
        })
        resultsArr.sort((a, b) => (a.score > b.score ) ? 1 : -1)
        resultsArr.reverse()
        console.log('*******')
        console.log(resultsArr)
        setLeaderboard(resultsArr)
    }, [posts])
    
    /* Ensure the chat always stays scrolled to the bottom */
    const keepScrolled = useRef()
    useEffect(() => {
        keepScrolled.current.scrollIntoView({ behavior: 'smooth' })
    }, [posts])

    // const entry = (obj) => ()

    return (
        <StyledHistoryPanel>
            <div className="leaderboard">
                <h4>Leaderboard</h4>
                { leaderboard && leaderboard.map(x => (
                    <StyledEntry>
                        <div className='name'>{x.profileName}</div>
                        <div className="score">{x.score}</div>
                    </StyledEntry>
                )) }
            </div>
            <div className="container">
                <div className="space"></div>
                { posts && posts.map(x => <Post key={x.id} post={x} />)}
                <div ref={keepScrolled}></div>
            </div>
        </StyledHistoryPanel>
    )
}
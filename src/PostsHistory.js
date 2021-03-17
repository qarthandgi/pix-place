import styled from 'styled-components'
import firebase from 'firebase'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useEffect, useRef } from 'react'

import { GlassPanel } from './styles'
import Post from './Post'

const StyledHistoryPanel = styled(GlassPanel)`
    height: 100%;
    overflow: hidden;
    width: 400px;
    .container {
        width: 100%;
        height: 100%;
        overflow: scroll;
        display: flex;
        flex-flow: column;
        .space {
            flex: 1;
        }
    }
`

export default function PostsHistory() {

    // Get firestore instance, prepare the firestore query, and initiate data
    const firestore = firebase.firestore()
    const postsRef = firestore.collection('posts')
    const postsRefQuery = postsRef.orderBy('createdAt').limit(25)
    const [posts] = useCollectionData(postsRefQuery, {idField: 'id'})
    
    /* Ensure the chat always stays scrolled to the bottom */
    const keepScrolled = useRef()
    useEffect(() => {
        keepScrolled.current.scrollIntoView({ behavior: 'smooth' })
    }, [posts])

    return (
        <StyledHistoryPanel>
            <div className="container">
                <div className="space"></div>
                { posts && posts.map(x => <Post key={x.id} post={x} />)}
                <div ref={keepScrolled}></div>
            </div>
        </StyledHistoryPanel>
    )
}
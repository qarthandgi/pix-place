import styled from 'styled-components'
import PostsHistory from './PostsHistory'
import CaptureDashboard from './CaptureDashboard'
import SignOut from './SignOut'

const DashboardPane = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    margin: 20px;
    aside {
        flex: 1;
        height: 100%;
    }
`

const StyledSignOut = styled(SignOut)`
    position: fixed;
    top: 10px;
    left: 10px;
    background-color: transparent;
    outline: none;
    border-radius: 10px;
    cursor: pointer;
`

export default function Dashboard() {

    // const leader
    return (
        <DashboardPane>
            <StyledSignOut />
            <CaptureDashboard />
            <PostsHistory />
        </DashboardPane>
    )
}
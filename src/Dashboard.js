import styled from 'styled-components'
import PostsHistory from './PostsHistory'
import CaptureDashboard from './CaptureDashboard'

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

export default function Dashboard() {
    return (
        <DashboardPane>
            <CaptureDashboard />
            <PostsHistory />
        </DashboardPane>
    )
}
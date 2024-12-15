import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
    const navigate = useNavigate()
    return (
        <div onClick={() => {
            navigate("fax");
        }}>Connect to socket</div>
    )
}

export default Home
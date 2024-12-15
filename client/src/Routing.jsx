import React from 'react'
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import PublicLayout from './layout/PublicLayout';
import Home from './pages/Home';
import Calling from './pages/Calling';
import SocketProvider from './context/SocketConnectContext';

function Routing() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route>

                <Route path="/" element={<PublicLayout />} >
                    <Route index element={<Home />} />
                    <Route path="fax" element={<SocketProvider><Calling /></SocketProvider>} />

                </Route>


            </Route>
        )
    );
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}

export default Routing
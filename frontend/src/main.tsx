import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './providers/AuthProvider';
import Play from './pages/Play';
import Expiremental from './pages/Expiramental';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing/>,
    },
    {
        path: "/explore",
        element: <Explore/>
    },
    {
        path: "/signup",
        element: <Signup/>
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/dashboard",
        element: <Dashboard/>
    },
    {
        path: "/play/:videoId",
        element: <Play/>
    }, 
    {
        path: "/expiremental",
        element: <Expiremental/>
    }
]);

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
)

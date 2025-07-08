import {createBrowserRouter} from 'react-router-dom';
import App from '../App';
import Dashboard from '../Components/Dashboard';
import Login from '../Components/Login';
export  const router = createBrowserRouter([
    {path:'/',element:<App/>},
    {path:'/dashboard',element:<Dashboard/>},
    {path:'/login',element:<Login/>}

])
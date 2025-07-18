// src/Routes/router.js
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../Components/Login';
import ChatMember from '../Components/ChatMember';
import FriendRequest from '../Components/FriendRequest';
import Chat from '../Components/Chat';
import Notification from '../Components/Notification';
import Info from '../Components/Info';
import AboutMe from '../Components/AboutMe';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'messages',
        element: <ChatMember />,
        children: [
          {
            path: ':id',
            element: <Chat />,
            children: [
              {
                path: 'info',
                element: <Info />,
              },
            ],
          },
        ],
      },
      {
        path: 'friend_request',
        element: <FriendRequest />,
      },
      {
        path: 'notification',
        element: <Notification />,
      },
      {
        path: 'about_me',
        element: <AboutMe />,
      }
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

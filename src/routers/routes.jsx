import { createBrowserRouter, createBrowserRouter as createRouter } from "react-router-dom";

//coomponents
import App from "../App.jsx";
import Register from "../pages/Register.jsx";
import Login from "../pages/Login.jsx";
import ResetLink from "../pages/ResetLink.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import Conversation from "../pages/Conversation.jsx";
import ConversationError from "../pages/ConversationError.jsx";
import RootError from "../pages/RootError.jsx";
//actions
import registerAction from "./actions/registerActions.js";
import loginAction from "./actions/loginAction.js";
import resetLinkAction from "./actions/resetLinkAction.js";
import resetPasswordAction from "./actions/resetPasswordAction.js";
import appAction from "./actions/appAction.js";
import conversationAction from "./actions/conversationAction.js";
//loaders
import registerLoader from "./loaders/registerLoader.js";
import loginLoader from "./loaders/loginLoader.js";
import resetLinkLoader from "./loaders/resetLinkLoader.js";
import resetPasswordLoader from "./loaders/resetPasswordLoader.js";
import appLoader from './loaders/appLoader.js';
import conversationLoader from "./loaders/conversationLoader.js";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        loader: appLoader,
        action: appAction,
        errorElement: <RootError/>,
        children: [
            {
            path: '/:conversationId',
            element:<Conversation />,
            loader: conversationLoader,
            action: conversationAction,
            errorElement: <ConversationError/>
            }
        ]
    },
    {
        path: '/register',
        element: <Register />,
        action: registerAction,
        loader: registerLoader,
    },
    {
        path: '/login',
        element: <Login />,
        action: loginAction,
        loader: loginLoader,
    },
    {
        path: '/reset-link',
        element: <ResetLink />,
        action: resetLinkAction,
        loader:resetLinkLoader,
       
    },
    {
        path: '/reset-password',
        element: <ResetPassword />,
        action: resetPasswordAction,
        loader: resetPasswordLoader,
    },
    
]);

export default router;
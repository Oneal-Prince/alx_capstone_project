import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";

import HomePage from "./components/HomePage";
import Editor from "./pages/Editor";


const router = createBrowserRouter ([

{
  path:'/',
  Component: HomePage
},
{
  path:'/Login',
  Component: Login
},
{
  path:'/Editor',
  Component: Editor
}
]);

export default router
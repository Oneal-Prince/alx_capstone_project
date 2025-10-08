import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Editor from "./pages/Editor";
import HomePage from "./components/HomePage";


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
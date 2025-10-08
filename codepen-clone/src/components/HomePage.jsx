import { useNavigate } from "react-router";
import Login from "../pages/Login";

function HomePage() {
  const navigate = useNavigate();
  const click = () => {
    navigate('/Login')
  }
  
  return (
    
    <div className=" dark:bg-gray-950 h-screen">

         <h1 className="text-xl font-bold mb-4 text-green-900 text-center pt-40 p-40">CodePen-style code editor</h1>
    <button onClick={click}>Welcome</button>
    </div>
  
        
        

     
   );
}

export default HomePage;
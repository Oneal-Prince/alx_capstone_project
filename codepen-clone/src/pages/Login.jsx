import { useState } from "react";
import { Link } from "react-router";




function Login() {
  const [action, setAction] = useState("Login")


   
  return ( 
    <div className="dark:bg-gray-800 pt-20 h-screen outline-none flex flex-col">
      <div className="flex flex-col gap-4 items-center ">
        <div className="text-blue-800 text-7xl font-bold">{ action }</div>
        <div className="bg-blue-800 w-20 h-2 rounded-md"></div>
      </div>
   
      <div className="mt-20 flex flex-col gap-2 ">
     
        {action==="Login"?<div></div>:
        <div>
          <form  action="" className="flex flex-col  mx-auto items-center">
            <div >
                <label className="text-sky-400 font-bold text-2xl"  htmlFor="User">User</label>
                  <input className="bg-white m-2 p-[10px] outline-none border-none" 
              type="text" required placeholder="Name"/>
            </div>
`           
          </form>
</div>}
                     
               
          <form action="" className="flex flex-col  mx-auto items-center">
            <div >
                <label className="text-sky-400 font-bold text-2xl"  htmlFor="Email">Email</label>
                  <input className="bg-white text-base m-2 p-[10px] outline-none border-none" 
              type="email" required placeholder="Email Id" />
            </div>
`           
          </form>
      
         
          <form action="" className="flex flex-col w-[50%] mx-auto items-center">
            <div >
                <label className="text-sky-400 font-bold text-2xl"  htmlFor="Password">Password</label>
                  <input className="bg-white text-sm m-2 p-[10px] outline-none border-none" 
              type="password" required placeholder="Password" />
            </div>
`           
          </form>

       
      </div>
      
      
      {action==="Sign up"?<div></div>: <div className="mx-auto text-stone-400">Forget Password? <span className="text-yellow-100 cursor-pointer">Click here!</span></div>}
     
      <div className="flex gap-6 mx-auto p-8">
        <div className={action==="Login" ? "bt1 gray":"bt1"} onClick={() =>{setAction("Sign up")}}>Sign Up</div>
        <Link to="/Editor">
        <div className={action==="Sign up" ? "bt2 gray" :"bt2"} onClick={() =>{setAction("Login")}}>Login</div>
        </Link>
        
      </div>
    </div>
   );
}

export default Login;
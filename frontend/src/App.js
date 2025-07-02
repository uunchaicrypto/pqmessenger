import logo from "./logo.svg";
import Typewriter from "typewriter-effect";
import { MdEmail } from "react-icons/md";
import { HiMail } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { FaLock } from "react-icons/fa";
import { useState } from "react";
function App() {
  const [pageaside, setPageaside] = useState('Login')
  const handleBPage = () => {
    if(pageaside==="Login"){
      setPageaside('Sign Up')
    }
    else{
      setPageaside('Login')
    }
    
  }
  
  return (
    <>
      <main class="relative h-screen w-screen">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <div class="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
        </div>
        <section className="h-[90vh] w-screen flex justify-center items-center">
          <div className="bg-slate-200/50 w-[57vw] h-[61vh] shadow-xl rounded-xl flex   ">
            <div className="bg-[#ffffff] w-[50%] rounded-xl rounded-e-[30%]  ">
              <div className="flex items-center mt-3 p-4">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-500 to-red-500 text-transparent bg-clip-text">
                  U
                </div>
                <div className="flex items-center">
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-500 to-red-500 text-transparent bg-clip-text">
                    C
                  </div>
                  <span className="text-2xl font-semibold bg-gradient-to-r from-blue-500 via-indigo-500 mt-2 to-red-500 text-transparent bg-clip-text">
                    ryptography
                  </span>
                </div>
              </div>
              <div className="pl-8 flex  w-[80%] h-[80%] flex-col mt-16 items-center">
                <div className="text-4xl font-medium font-poppins mt-5">
                  <Typewriter
                    options={{
                      autoStart: true,
                      delay: 150,
                      pauseFor: 10000,
                      loop: true,
                      strings: ["Hello, Welcome!"],
                    }}
                  />
                </div>
                <div className="mt-3">
                  {pageaside === 'Login'&&<p>Don't have an account?</p>}
                  {pageaside === 'Sign Up'&&<p>Have an account already?</p>}
                  
                </div>
                <div className="mt-4">
                  <button onClick={handleBPage}
                    type="button"
                    className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                  >
                    {pageaside === 'Login'&&'Register Now'}
                    {pageaside === 'Sign Up'&&'Login'}
                    
                  </button>
                </div>
              </div>
            </div>
            <div className="w-[50%]">
              <div className="mt-20 ">
                <div>
                  <h1 className="text-5xl font-medium text-center font-poppins mt-5">
                    {pageaside},
                  </h1>
                </div>
                <div className="pl-14 pt-9">
                  {/* <input type="text" placeholder="Email" /> */}
                    {pageaside ==='Sign Up'&& (<div className="mt-3 flex">
                    <input
                      className="px-4 py-2 w-[20vw] rounded-md"
                      type="text"
                      placeholder="Email"
                    />
                    <MdEmail color="#959595" size="1.5em" className="relative right-8 top-2 "/>
                  </div>)}
                  <div className="mt-3 flex">
                    <input
                      className="px-4 py-2 w-[20vw] rounded-md"
                      type="text"
                      placeholder="Username"
                    />
                    <CgProfile color="#959595" size="1.5em" className="relative right-8 top-2 "/>
                  </div>
                  <div className="mt-3 flex">
                    <input
                      className="px-4 py-2 w-[20vw] rounded-md"
                      type="password"
                      placeholder="Password"
                    />
                    <FaLock color="#959595" size="1.2em" className="relative right-8 top-2 "/>
                  </div>
                  <div className="mt-4 mb-2 ml-2">
                    <p className="underline">Forget Password?</p>
                  </div>
                  <div className="mt-3 ">
                    <button type="button" className="text-white bg-gray-800 w-[80%] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-3xl text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">{pageaside}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;

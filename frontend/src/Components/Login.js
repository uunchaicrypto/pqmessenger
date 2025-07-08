import React from "react";
// import logo from "./logo.svg";
import Typewriter from "typewriter-effect";
import { MdEmail } from "react-icons/md";
import { HiMail } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { FaLock } from "react-icons/fa";
import { useState } from "react";
import { UserAuth } from "../context/AuthContext";
const Login = () => {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [loading, setloading] = useState("");
  const [pageaside, setPageaside] = useState("Login");
  const [darkMode, setDarkMode] = useState(false)
  const session = UserAuth();
  console.log(session);

  const handleBPage = () => {
    if (pageaside === "Login") {
      setPageaside("Sign Up");
    } else {
      setPageaside("Login");
    }
  };
  const handleTheme =() => {
    if (darkMode===false) {
      setDarkMode(true)
      
    }
    else{
      setDarkMode(false)
    }
  }
  

  return (
    <>
      <main className="relative h-screen w-screen">
        {!darkMode?(<div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
        </div>):<div className="absolute inset-0 -z-10 h-full w-full bg-[#0f0f0f] bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:14px_24px]">
  <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-500 opacity-30 blur-[100px]"></div>
</div>
}
        {!darkMode?(<section className="h-[90vh] w-screen flex justify-center items-center">
          <div className="bg-slate-200/50 w-full mt-20 rounded-b-2xl md:rounded-b-xl max-w-6xl md:w-[57vw] h-[90vh] md:h-[65vh] shadow-xl rounded-xl flex flex-col md:flex-row">
            {/* Left Side */}
            <div className={"bg-white w-full md:w-1/2 rounded-t-xl pb-20 md:rounded-l-xl md:rounded-e-[30%] rounded-b-[10%]"}>
              <div className="flex items-center mt-4 px-4 md:px-8">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-500 to-red-500 text-transparent bg-clip-text">
                  U
                </div>
                <div className="flex items-center ml-2">
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-500 to-red-500 text-transparent bg-clip-text">
                    C
                  </div>
                  <span className="text-2xl font-semibold bg-gradient-to-r from-blue-500 via-indigo-500 to-red-500 text-transparent bg-clip-text ml-1 mt-1">
                    ryptography
                  </span>
                </div>
              </div>

              <div className="px-6 md:px-10 flex flex-col mt-14 md:mt-20 items-center  h-full">
                <div className="text-2xl md:text-4xl font-medium font-poppins text-center">
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

                <div className="mt-4 text-center">
                  {pageaside === "Login" && <p>Don't have an account?</p>}
                  {pageaside === "Sign Up" && <p>Have an account already?</p>}
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleBPage}
                    type="button"
                    className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
                  >
                    {pageaside === "Login" ? "Register Now" : "Login"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="w-full md:w-1/2 px-4  flex-col justify-center">
            <div className="text-end text-xl pt-3 pr-1 hidden md:block">
             <button type="button" onClick={handleTheme} class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">{darkMode ? "☀ Light" : "🌙 Dark"}</button>

            
             

            </div>
            <div className=" py-8 md:px-10 md:py-14">

              <h1 className="text-3xl md:text-5xl font-medium text-center font-poppins mb-6">
                {pageaside},
              </h1>

              <form className="flex flex-col items-center gap-4">
                <div className="w-full max-w-sm flex relative">
                  <input
                    className="px-4 py-2 w-full rounded-md pr-10"
                    type="text"
                    placeholder="Username"
                    />
                  <CgProfile
                    color="#959595"
                    size="1.5em"
                    className="absolute right-3 top-3"
                  />
                </div>

                <div className="w-full max-w-sm flex relative">
                  <input
                    className="px-4 py-2 w-full rounded-md pr-10"
                    type="password"
                    placeholder="Password"
                    />
                  <FaLock
                    color="#959595"
                    size="1.2em"
                    className="absolute right-3 top-3"
                    />
                </div>
                {pageaside === "Sign Up" && (
                  <div className="w-full max-w-sm flex relative">
                    <input
                      className="px-4 py-2 w-full rounded-md pr-10"
                      type="text"
                      placeholder="Confirm Password"
                      />
                    <MdEmail
                      color="#959595"
                      size="1.5em"
                      className="absolute right-3 top-3"
                      />
                  </div>
                )}

                <div className="text-sm underline text-gray-600 self-start ml-2 hover:cursor-pointer">
                  Forget Password?
                </div>

                {pageaside === "Sign Up" && (
                  <button
                  disabled={loading}
                  type="submit"
                  className="mt-2 text-white bg-gray-800 w-full max-w-sm hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-3xl text-sm px-5 py-2.5"
                  >
                    Sign Up
                  </button>
                )}
                {pageaside === "Login" && (
                  <button
                  disabled={loading}
                  type="submit"
                  className="mt-2 text-white bg-gray-800 w-full max-w-sm hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-3xl text-sm px-5 py-2.5"
                  >
                    Login
                  </button>
                )}
              </form>
            </div>
                </div>
          </div>
        </section>):(<section className="h-[90vh] w-screen flex justify-center items-center bg-transparent">
  <div className="bg-black/50 backdrop-blur-md w-full mt-20 rounded-b-2xl md:rounded-b-xl max-w-6xl md:w-[57vw] h-[90vh] md:h-[65vh] shadow-2xl rounded-xl flex flex-col md:flex-row border border-white/10">
    
    {/* Left Side */}
    <div className="bg-black/60 text-white w-full md:w-1/2 rounded-t-xl pb-20 md:rounded-l-xl md:rounded-e-[30%] rounded-b-[10%] border-r border-white/10">
      <div className="flex items-center mt-4 px-4 md:px-8">
        <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-red-400 text-transparent bg-clip-text">
          U
        </div>
        <div className="flex items-center ml-2">
          <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-red-400 text-transparent bg-clip-text">
            C
          </div>
          <span className="text-2xl font-semibold bg-gradient-to-r from-blue-400 via-indigo-400 to-red-400 text-transparent bg-clip-text ml-1 mt-1">
            ryptography
          </span>
        </div>
      </div>

      <div className="px-6 md:px-10 flex flex-col mt-14 md:mt-20 items-center h-full">
        <div className="text-2xl md:text-4xl font-medium font-poppins text-center text-white">
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

        <div className="mt-4 text-center text-gray-300">
          {pageaside === "Login" && <p>Don't have an account?</p>}
          {pageaside === "Sign Up" && <p>Have an account already?</p>}
        </div>

        <div className="mt-4">
          <button
            onClick={handleBPage}
            type="button"
            className="text-white bg-gray-700 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
          >
            {pageaside === "Login" ? "Register Now" : "Login"}
          </button>
        </div>
      </div>
    </div>

    {/* Right Side */}
    <div className="w-full md:w-1/2 px-4 flex-col justify-center text-white">
      <div className="text-end text-xl pt-3 pr-1 hidden md:block">
        <button
          type="button"
          onClick={handleTheme}
          className={!darkMode?("text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-500 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"):("text-black bg-white hover:bg-white/50 focus:outline-none focus:ring-4 focus:ring-gray-500 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2")}
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="py-8 md:px-10 md:py-14">
        <h1 className="text-3xl md:text-5xl font-medium text-center font-poppins mb-6">
          {pageaside},
        </h1>

        <form className="flex flex-col items-center gap-4">
          <div className="w-full max-w-sm flex relative">
            <input
              className="px-4 py-2 w-full rounded-md pr-10 bg-gray-900/70 text-white placeholder-gray-400"
              type="text"
              placeholder="Username"
            />
            <CgProfile
              color="#bbbbbb"
              size="1.5em"
              className="absolute right-3 top-3"
            />
          </div>

          <div className="w-full max-w-sm flex relative">
            <input
              className="px-4 py-2 w-full rounded-md pr-10 bg-gray-900/70 text-white placeholder-gray-400"
              type="password"
              placeholder="Password"
            />
            <FaLock
              color="#bbbbbb"
              size="1.2em"
              className="absolute right-3 top-3"
            />
          </div>

          {pageaside === "Sign Up" && (
            <div className="w-full max-w-sm flex relative">
              <input
                className="px-4 py-2 w-full rounded-md pr-10 bg-gray-900/70 text-white placeholder-gray-400"
                type="text"
                placeholder="Confirm Password"
              />
              <MdEmail
                color="#bbbbbb"
                size="1.5em"
                className="absolute right-3 top-3"
              />
            </div>
          )}

          <div className="text-sm underline text-gray-400 self-start ml-2 hover:cursor-pointer">
            Forgot Password?
          </div>

          <button
            disabled={loading}
            type="submit"
            className="mt-2 text-white bg-gray-700/30 w-full max-w-sm hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-500 font-medium rounded-3xl text-sm px-5 py-2.5"
          >
            {pageaside === "Sign Up" ? "Sign Up" : "Login"}
          </button>
        </form>
      </div>
    </div>
  </div>
</section>

)}
      </main>
    </>
  );
};

export default Login;  
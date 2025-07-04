import logo from "./logo.svg";
import Typewriter from "typewriter-effect";
import { MdEmail } from "react-icons/md";
import { HiMail } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { FaLock } from "react-icons/fa";
import { useState } from "react";
import { UserAuth } from "./context/AuthContext";
function App() {
  const [username, setusername] = useState('')
  const [password, setpassword] = useState('')
  const [confirmPassword, setconfirmPassword] = useState('')
  const [loading, setloading] = useState('')
  const [pageaside, setPageaside] = useState('Login')
  const session  = UserAuth()
  console.log(session);
  
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
      <main className="relative h-screen w-screen">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
        </div>
        <section className="h-[90vh] w-screen flex justify-center items-center">
          <div className="bg-slate-200/50 w-full mt-20 rounded-b-2xl md:rounded-b-xl max-w-6xl md:w-[57vw] h-[90vh] md:h-[65vh] shadow-xl rounded-xl flex flex-col md:flex-row">
  {/* Left Side */}
  <div className="bg-white w-full md:w-1/2 rounded-t-xl pb-20 md:rounded-l-xl md:rounded-e-[30%] rounded-b-[10%]">
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
  <div className="w-full md:w-1/2 px-4 md:px-14 py-8 flex flex-col justify-center">
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

      <div className="text-sm underline text-gray-600 self-start ml-2">
        Forget Password?
      </div>

      <button disabled={loading}
        type="submit"
        className="mt-2 text-white bg-gray-800 w-full max-w-sm hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-3xl text-sm px-5 py-2.5"
      >
        {pageaside}
      </button>
    </form>
  </div>
</div>

        </section>
      </main>
    </>
  );
}

export default App;

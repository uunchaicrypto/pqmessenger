import React, { useState, useEffect } from "react";
import Typewriter from "typewriter-effect";
import { MdEmail } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { FaLock } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { AxiosClient } from "../utils/AxiosClient";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Login = () => {
  const [pageaside, setPageaside] = useState("Login");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();
  const { fetchUserProfile, user } = UserAuth();

  // ✅ Redirect if user already logged in
  useEffect(() => {
    if (user && Object.keys(user).length !== 0) {
      navigate("/", { replace: true });
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile()
        .then((fetchedUser) => {
          if (fetchedUser && Object.keys(fetchedUser).length !== 0) {
            navigate("/", { replace: true });
          }
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          localStorage.removeItem("token");
        });
    }
  }, [user, navigate]);

  const handleSubmit = async (values) => {
    setloading(true);
    try {
      if (pageaside === "Login") {
        const response = await AxiosClient.post("/login", {
          username: values.username,
          password: values.password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", values.username);
        await fetchUserProfile();
        navigate("/");
        toast.success("Login successful!");
      } else {
        const response = await AxiosClient.post("/register", {
          username: values.username,
          password: values.password,
          confirm_password: values.confirmPassword,
        });

        toast.success("Sign Up successful!");
        setPageaside("Login");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error?.response?.data?.error || "Request failed. Try again.");
    } finally {
      setloading(false);
    }
  };

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  });

  const SignUpSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const handleType = () => {
    setPageaside(pageaside === "Login" ? "Sign Up" : "Login");
  };

  return (
    <main className="relative h-screen w-screen">
      {/* Background */}
      <div
        className={`absolute inset-0 -z-10 h-full w-full ${
          darkMode
            ? "bg-[#0f0f0f] bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)]"
            : "bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)]"
        } bg-[size:14px_24px]`}
      >
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-500 opacity-30 blur-[100px]"></div>
      </div>

      <section className="h-[90vh] w-screen flex justify-center items-center">
        <div
          className={`${
            darkMode
              ? "bg-black/50 backdrop-blur-md border border-white/10"
              : "bg-slate-200/50"
          } w-full mt-20 rounded-b-2xl md:rounded-b-xl max-w-6xl md:w-[57vw] h-[90vh] md:h-[65vh] shadow-xl rounded-xl flex flex-col md:flex-row`}
        >
          {/* Left Panel */}
          <div
            className={`${
              darkMode
                ? "bg-black/60 text-white border-r border-white/10"
                : "bg-white"
            } w-full md:w-1/2 rounded-t-xl pb-20 md:rounded-l-xl md:rounded-e-[30%] rounded-b-[10%]`}
          >
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

            <div className="px-6 md:px-10 flex flex-col mt-14 md:mt-20 items-center h-full">
              <div
                className={`text-2xl md:text-4xl font-medium font-poppins text-center ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
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
                {pageaside === "Login" ? (
                  <p>Don't have an account?</p>
                ) : (
                  <p>Have an account already?</p>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={handleType}
                  className={`${
                    darkMode ? "bg-gray-700" : "bg-gray-800"
                  } text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 mb-2`}
                >
                  {pageaside === "Login" ? "Register Now" : "Login"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-1/2 px-4 flex-col justify-center">
            <div className="text-end text-xl pt-3 pr-1 hidden md:block">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`${
                  darkMode
                    ? "text-black bg-white hover:bg-white/80"
                    : "text-white bg-gray-800 hover:bg-gray-900"
                } focus:outline-none focus:ring-4 focus:ring-gray-500 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2`}
              >
                {darkMode ? "☀ Light" : "🌙 Dark"}
              </button>
            </div>

            <div className="py-8 md:px-10 md:py-14">
              <h1
                className={`text-3xl md:text-5xl font-medium text-center font-poppins mb-6 ${
                  darkMode && "text-white"
                }`}
              >
                {pageaside},
              </h1>

              <Formik
                initialValues={{
                  username: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={
                  pageaside === "Login" ? LoginSchema : SignUpSchema
                }
                onSubmit={handleSubmit}
              >
                <Form className="flex flex-col items-center gap-4">
                  {/* Username */}
                  <div className="w-full max-w-sm flex flex-col relative">
                    <Field
                      name="username"
                      type="text"
                      placeholder="Username"
                      className={`px-4 py-2 w-full rounded-md pr-10 ${
                        darkMode
                          ? "bg-gray-900/70 text-white placeholder-gray-400"
                          : ""
                      }`}
                    />
                    <CgProfile
                      className="absolute right-3 top-3"
                      color={darkMode ? "#bbbbbb" : "#959595"}
                      size="1.5em"
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Password */}
                  <div className="w-full max-w-sm flex flex-col relative">
                    <Field
                      name="password"
                      type="password"
                      placeholder="Password"
                      className={`px-4 py-2 w-full rounded-md pr-10 ${
                        darkMode
                          ? "bg-gray-900/70 text-white placeholder-gray-400"
                          : ""
                      }`}
                    />
                    <FaLock
                      className="absolute right-3 top-3"
                      color={darkMode ? "#bbbbbb" : "#959595"}
                      size="1.2em"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Confirm Password */}
                  {pageaside === "Sign Up" && (
                    <div className="w-full max-w-sm flex flex-col relative">
                      <Field
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        className={`px-4 py-2 w-full rounded-md pr-10 ${
                          darkMode
                            ? "bg-gray-900/70 text-white placeholder-gray-400"
                            : ""
                        }`}
                      />
                      <MdEmail
                        className="absolute right-3 top-3"
                        color={darkMode ? "#bbbbbb" : "#959595"}
                        size="1.5em"
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  )}

                  <div
                    className={`text-sm underline ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } self-start ml-2 hover:cursor-pointer`}
                  >
                    Forgot Password?
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`mt-2 ${
                      darkMode
                        ? "bg-gray-700/30 text-white hover:bg-gray-900"
                        : "bg-gray-800 text-white hover:bg-gray-900"
                    } w-full max-w-sm focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-3xl text-sm px-5 py-2.5 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Loading..." : pageaside}
                  </button>
                </Form>
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;

import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Register = () => {
  const navigate = useNavigate();
  const [errorsMessage, setErrorsMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [membership, setMembership] = useState("Regular");
  const [showAnnualFee, setShowAnnualFee] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const formData = { ...data, membership };

    setIsRegistering(true);
    try {
      const response = await axios.post("/auth/register", formData);
      toast.success("Registration successful!", {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: false,
      });
      navigate("/");
    } catch (error) {
      console.error(error.response.data);
      setErrorsMessage(error.response.data);
      toast.error("Error", {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: false,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const inputClasses = () => {
    return "appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-blue-500";
  };

  const handleMembership = (e) => {
    setMembership(e.target.value);
    if (e.target.value === "Premium") setShowAnnualFee(true);
    else setShowAnnualFee(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br py-12 px-4 sm:opx-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-4 shadow-xl">
        <div>
          <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900">
            Register
          </h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="username" className="text-gray-700">
              Username:
            </label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              {...register("username", { required: true })}
              className={inputClasses`${
                errors.username ? "border-red-500" : ""
              }`}
            />
            {errors.username && (
              <span className="text-sm text-red-500">Username is required</span>
            )}
          </div>
          <div>
            <label htmlFor="email" className="text-gray-700">
              Email:
            </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              {...register("email", { required: true })}
              className={inputClasses`${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && (
              <span className="text-sm text-red-500">Email is required</span>
            )}
          </div>
          <div>
            <label htmlFor="password" className="text-gray-700">
              Password:
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
              className={inputClasses`${
                errors.password ? "border-red-500" : ""
              }`}
			  placeholder="Password"
            />
            {errors.password && (
              <span className="text-sm text-red-500">
                {errors.password?.message}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="membership" className="text-gray-700 block">
              Membership:
            </label>
            <div className="relative">
              <select
                {...register("membership", { required: true })}
                className="block appearance-none w-full py-2 px-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                value={membership}
                onChange={handleMembership}
              >
                <option value="Regular">Regular</option>
                <option value="Premium">Premium</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          {showAnnualFee && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4">
              An annual fee of $15 will be charged for Premium membership
            </div>
          )}

          {errorsMessage && (
            <span className="text-sm text-red-500">{errorsMessage}</span>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-blue-600 bg-gradient-to-br from-indigo-600 py-2 px-4 font-medium text-white drop-shadow-md hover:bg-blue-700 hover:from-indigo-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-slate-500 disabled:to-slate-400"
            disabled={isRegistering}
          >
            {isRegistering ? "Processing..." : "Register"}
          </button>
        </form>
        <p className="text-right">
          Already have an account?{" "}
          <Link to={"/login"} className="font-bold text-blue-600">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
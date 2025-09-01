'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap, FaSignInAlt, FaUsers, FaLightbulb, FaBriefcase } from 'react-icons/fa'; // Added FaUsers, FaLightbulb, FaBriefcase for the list

const StudentLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const { email, password } = data;
    setIsValid(email.trim() !== "" && password.trim() !== "");
  }, [data]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "STUDENT") {
      router.push("/studentdashboard");
    }
  }, [session, status, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (res.ok) {
      // Session will update, useEffect will redirect
    } else {
      alert("Invalid credentials or not a student account.");
    }
  };

  const handleForgotPassword = () => {
    // Store the role in local storage to use it in the password reset flow
    localStorage.setItem('userRole', 'STUDENT');
    router.push("/forgotpassword");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <FaGraduationCap className="text-white text-xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">KCUTSA</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your student account</p>
        </motion.div>

        <motion.form className="bg-white rounded-2xl shadow-xl p-8" variants={containerVariants}
          initial="hidden" animate="visible" onSubmit={handleSubmit}>
          <motion.div variants={itemVariants} className="mb-6">
            <label className="block text-base font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2 text-blue-600" />Email Address
            </label>
            <input type="email" placeholder="Enter your email" value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full h-15 border border-gray-300 rounded-lg px-5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              required />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <label className="block text-base font-medium text-gray-700 mb-2">
              <FaLock className="inline mr-2 text-blue-600" />Password
            </label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="w-full h-15 border border-gray-300 rounded-lg px-5 pr-14 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                required />
              <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash size={25} /> : <FaEye size={25} />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6 text-right">
            <a onClick={handleForgotPassword} className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 cursor-pointer">
              Forgot your password?
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <button type="submit" disabled={isSubmitting || !isValid}
              className={`w-full h-15 rounded-lg font-semibold text-lg text-white transition-all duration-300 ${
                isSubmitting || !isValid ? 'bg-gray-400 cursor-not-allowed' :
                'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform'
              }`}>
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FaSignInAlt className="mr-2" />Sign In
                </div>
              )}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-gray-600 text-lg">
              Don't have an account?{' '}
              <a href="/studentRegister" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200">
                Sign Up
              </a>
            </p>
          </motion.div>

          {/* New Description List Section */}
          <motion.div variants={itemVariants} className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
              <FaGraduationCap className="mr-2" />Student Benefits
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Connect with other students</li>
              <li>• Access exclusive job and internship opportunities</li>
              <li>• Receive mentorship and career guidance</li>
              <li>• Participate in community service and networking events</li>
            </ul>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default StudentLogin;
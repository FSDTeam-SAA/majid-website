"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Store,
  User,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useSignUp } from "../hooks/useSignUp";
import { useRouter } from "next/navigation";
import { RegisterPayload } from "../types/auth.types";
import { StructuredAddressFields } from "@/components/ui/structured-address-fields";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signUp, loading, error } = useSignUp();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "", // This will map to whatsappNumber for shopkeeper
    password: "",
    confirmPassword: "",
    role: "user", // Default role
    shopName: "",
    shopAddress: "",
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Splitting name into firstName and lastName for the API
    const nameParts = formData.name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const payload: RegisterPayload = {
      firstName,
      lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === "shopkeeper") {
      payload.shopName = formData.shopName;
      payload.shopAddress = formData.shopAddress;
      payload.whatsappNumber = formData.whatsapp;
    }

    try {
      const response = await signUp(payload);
      if (response.success) {
        if (response.data?.accessToken) {
          localStorage.setItem("temp_auth_token", response.data.accessToken);
        }
        router.push("/auth/otp-verify");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-poppins relative overflow-x-hidden">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 transition-all group font-bold text-sm z-10"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[640px] bg-white rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-gray-100 my-20"
      >
        {/* Header */}
        <div className="mb-8 text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F172A] mb-4 tracking-tight">
            Create your Account
          </h1>
          <p className="text-[#64748B] text-sm sm:text-[15px] font-medium leading-relaxed">
            Join the premium ticketing experience. Select your role to get
            started.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-8 p-1.5 bg-gray-50 rounded-3xl flex gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "user" })}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-sm font-black transition-all ${
              formData.role === "user"
                ? "bg-white text-[#84CC16] shadow-[0_4px_20px_rgba(132,204,22,0.1)]"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <User size={18} />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "shopkeeper" })}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-sm font-black transition-all ${
              formData.role === "shopkeeper"
                ? "bg-white text-[#84CC16] shadow-[0_4px_20px_rgba(132,204,22,0.1)]"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Store size={18} />
            Shopkeeper
          </button>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-6 py-4 rounded-3xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-bold text-sm sm:text-base"
              />
            </div>
            <div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-6 py-4 rounded-3xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-bold text-sm sm:text-base"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {formData.role === "shopkeeper" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Shop Name"
                      value={formData.shopName}
                      onChange={(e) =>
                        setFormData({ ...formData, shopName: e.target.value })
                      }
                      className="w-full pl-14 pr-6 py-4 rounded-3xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-bold text-sm sm:text-base"
                    />
                  </div>
                  <div className="relative">
                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="WhatsApp Number"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      className="w-full pl-14 pr-6 py-4 rounded-3xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-bold text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-4">
                  <StructuredAddressFields
                    required
                    value={formData.shopAddress}
                    onChange={(shopAddress) =>
                      setFormData({ ...formData, shopAddress })
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-6 py-4 rounded-3xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-bold text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-6 py-4 rounded-3xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-bold text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 px-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, agreeToTerms: e.target.checked })
                  }
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-xl border-2 border-gray-100 checked:bg-[#84CC16] checked:border-[#84CC16] transition-all"
                />
                <svg
                  className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[13px] font-bold text-[#64748B] group-hover:text-[#0F172A] transition">
                I agree to the{" "}
                <span className="text-[#84CC16]">Terms of services</span> and{" "}
                <span className="text-[#84CC16]">Privacy Policy</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#84CC16] text-white font-black py-5 rounded-[28px] shadow-xl shadow-lime-500/20 text-lg mt-4 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:bg-[#76b813] transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-[15px] font-bold text-[#64748B]">
          Already a Member?{" "}
          <Link
            href="/auth/login"
            className="text-[#0F172A] hover:text-[#84CC16] transition border-b-2 border-transparent hover:border-[#84CC16] ml-1"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

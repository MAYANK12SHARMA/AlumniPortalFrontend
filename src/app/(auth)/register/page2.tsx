// "use client";

// import { useState } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Shield,
//   Mail,
//   Lock,
//   AlertCircle,
//   CheckCircle,
//   ArrowLeft,
// } from "lucide-react";
// import toast from "react-hot-toast";

// import { apiClient } from "@/lib/api";

// export default function RegisterPage() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "student",
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
//   const [showVerificationMessage, setShowVerificationMessage] = useState(false);
//   const [isResendingEmail, setIsResendingEmail] = useState(false);
//   const { register } = useAuth();
//   // const router = useRouter(); // Commented out as it's not used

//   const resendVerificationEmail = async () => {
//     if (!formData.email) return;

//     setIsResendingEmail(true);
//     try {
//       await apiClient.resendActivationEmail(formData.email);
//       toast.success("Verification email sent! Please check your inbox.");
//     } catch (error: any) {
//       console.error("Failed to resend email:", error);
//       toast.error("Failed to resend verification email. Please try again.");
//     } finally {
//       setIsResendingEmail(false);
//     }
//   };

//   const validateForm = () => {
//     const errors: Record<string, string> = {};

//     // Allowed email domains
//     const allowedDomains = ["gmail.com", "gla.ac.in"];

//     // Email validation
//     if (!formData.email) {
//       errors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       errors.email = "Please enter a valid email address";
//     } else {
//       // Check if email domain is allowed
//       const emailDomain = formData.email.split("@")[1]?.toLowerCase();
//       if (!allowedDomains.includes(emailDomain)) {
//         errors.email =
//           "Only gmail.com and gla.ac.in email addresses are allowed";
//       }
//     }

//     // Password validation
//     if (!formData.password) {
//       errors.password = "Password is required";
//     } else if (formData.password.length < 8) {
//       errors.password = "Password must be at least 8 characters long";
//     }

//     // Confirm password validation
//     if (!formData.confirmPassword) {
//       errors.confirmPassword = "Please confirm your password";
//     } else if (formData.password !== formData.confirmPassword) {
//       errors.confirmPassword = "Passwords do not match";
//     }

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Clear previous errors
//     setFieldErrors({});

//     // Client-side validation
//     if (!validateForm()) {
//       toast.error("Please fix the errors below");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const success = await register(
//         formData.email,
//         formData.password,
//         formData.role
//       );

//       if (success) {
//         setShowVerificationMessage(true);
//         toast.success(
//           "Registration successful! Please check your email to activate your account."
//         );
//       }
//     } catch (error: any) {
//       console.error("Registration failed:", error);

//       // Handle field-specific errors from backend
//       if (error.response?.data) {
//         const backendErrors: Record<string, string> = {};
//         const errorData = error.response.data;

//         if (errorData.email) {
//           backendErrors.email = Array.isArray(errorData.email)
//             ? errorData.email[0]
//             : errorData.email;
//         }
//         if (errorData.password) {
//           backendErrors.password = Array.isArray(errorData.password)
//             ? errorData.password[0]
//             : errorData.password;
//         }
//         if (errorData.re_password) {
//           backendErrors.confirmPassword = Array.isArray(errorData.re_password)
//             ? errorData.re_password[0]
//             : errorData.re_password;
//         }

//         if (Object.keys(backendErrors).length > 0) {
//           setFieldErrors(backendErrors);
//         }
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;

//     setFormData({
//       ...formData,
//       [name]: value,
//     });

//     // Clear field error when user starts typing
//     if (fieldErrors[name]) {
//       setFieldErrors({
//         ...fieldErrors,
//         [name]: "",
//       });
//     }

//     // Real-time email domain validation
//     if (name === "email" && value.includes("@")) {
//       const allowedDomains = ["gmail.com", "gla.ac.in"];
//       const emailDomain = value.split("@")[1]?.toLowerCase();

//       if (emailDomain && !allowedDomains.includes(emailDomain)) {
//         setFieldErrors((prev) => ({
//           ...prev,
//           email: "Only gmail.com and gla.ac.in email addresses are allowed",
//         }));
//       }
//     }

//     // Real-time validation for password confirmation
//     if (
//       name === "confirmPassword" ||
//       (name === "password" && formData.confirmPassword)
//     ) {
//       const newPassword = name === "password" ? value : formData.password;
//       const newConfirmPassword =
//         name === "confirmPassword" ? value : formData.confirmPassword;

//       if (newConfirmPassword && newPassword !== newConfirmPassword) {
//         setFieldErrors((prev) => ({
//           ...prev,
//           confirmPassword: "Passwords do not match",
//         }));
//       } else if (newPassword === newConfirmPassword) {
//         setFieldErrors((prev) => ({
//           ...prev,
//           confirmPassword: "",
//         }));
//       }
//     }
//   };

//   return (
//     <ProtectedRoute requireAuth={false}>
//       <div
//         className="relative min-h-screen overflow-hidden bg-[radial-gradient(80%_120%_at_10%_10%,#0a0a0a,rgba(0,0,0,1)_70%)]"
//         suppressHydrationWarning
//       >
//         {/* Subtle diagonal lines */}
//         <div className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(45deg,rgba(250,204,21,0.035)_0_16px,transparent_16px_32px)]" />

//         {/* Floating orbs animation */}
//         <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl orb" />
//         <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl orb2" />
//         <div className="absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-yellow-200/5 blur-3xl orb3" />

//         <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2">
//           {/* Left: Brand */}
//           <div className="hidden md:block">
//             <div className="flex items-center gap-3 text-yellow-400">
//               <Shield size={22} />
//               <span className="text-sm tracking-wide">Alumni Portal</span>
//             </div>
//             <h1 className="mt-4 text-4xl font-semibold leading-tight text-zinc-100">
//               Create your account,
//               <br />
//               join the community.
//             </h1>
//             <p className="mt-3 max-w-md text-zinc-400">
//               Build connections between students and alumni. Get mentorship,
//               opportunities, and more.
//             </p>
//             <p className="mt-6 text-xs text-zinc-500">
//               Already have an account?
//               <Link
//                 href="/auth/login"
//                 className="ml-1 text-yellow-300 hover:underline"
//               >
//                 Sign in
//               </Link>
//             </p>
//           </div>

//           {/* Right: Register Card */}
//           <div className="mx-auto w-full max-w-md">
//             <Card className="border-zinc-800 bg-black/60 backdrop-blur">
//               <CardContent className="p-6 sm:p-7">
//                 {showVerificationMessage ? (
//                   // Verification Message
//                   <div className="text-center">
//                     <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400">
//                       <CheckCircle size={32} />
//                     </div>
//                     <h2 className="text-xl font-semibold text-zinc-100 mb-2">
//                       Check Your Email
//                     </h2>
//                     <p className="text-zinc-400 mb-4 leading-relaxed">
//                       We've sent a verification link to{" "}
//                       <span className="text-yellow-300 font-medium">
//                         {formData.email}
//                       </span>
//                       <br />
//                       Please click the link to activate your account.
//                     </p>
//                     <div className="space-y-3">
//                       <p className="text-xs text-zinc-500">
//                         Didn't receive the email? Check your spam folder or{" "}
//                         <button
//                           onClick={resendVerificationEmail}
//                           disabled={isResendingEmail}
//                           className="text-yellow-300 hover:underline disabled:opacity-50"
//                         >
//                           {isResendingEmail
//                             ? "Sending..."
//                             : "resend verification email"}
//                         </button>
//                       </p>
//                       <button
//                         onClick={() => setShowVerificationMessage(false)}
//                         className="text-sm text-zinc-400 hover:text-zinc-300 underline"
//                       >
//                         Use a different email address
//                       </button>
//                       <div className="flex items-center justify-center gap-2">
//                         <ArrowLeft size={14} />
//                         <Link
//                           href="/auth/login"
//                           className="text-sm text-yellow-300 hover:underline"
//                         >
//                           Back to Login
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   // Registration Form
//                   <>
//                     <div className="mb-6 text-center">
//                       <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-yellow-500/40 bg-yellow-400/10 text-yellow-300">
//                         <Shield size={18} />
//                       </div>
//                       <h2 className="text-lg font-semibold text-zinc-100">
//                         Create your account
//                       </h2>
//                       <p className="mt-1 text-xs text-zinc-400">
//                         It's quick and easy. Choose your role to get started.
//                       </p>
//                     </div>

//                     <form className="space-y-4" onSubmit={handleSubmit}>
//                       <div className="space-y-3">
//                         <label
//                           htmlFor="email"
//                           className="block text-xs font-medium text-zinc-300"
//                         >
//                           Email address
//                         </label>
//                         <div className="relative">
//                           <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
//                             <Mail size={14} />
//                           </div>
//                           <Input
//                             id="email"
//                             name="email"
//                             type="email"
//                             autoComplete="email"
//                             required
//                             placeholder="you@gmail.com or you@gla.ac.in"
//                             className={`pl-9 ${
//                               fieldErrors.email
//                                 ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
//                                 : ""
//                             }`}
//                             value={formData.email}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         {!fieldErrors.email && (
//                           <div className="text-xs text-zinc-500">
//                             Only Gmail and GLA University email addresses are
//                             accepted
//                           </div>
//                         )}
//                         {fieldErrors.email && (
//                           <div className="flex items-center gap-2 text-xs text-red-400">
//                             <AlertCircle size={12} />
//                             {fieldErrors.email}
//                           </div>
//                         )}
//                       </div>

//                       <div className="space-y-3">
//                         <label
//                           htmlFor="role"
//                           className="block text-xs font-medium text-zinc-300"
//                         >
//                           I am a
//                         </label>
//                         <select
//                           id="role"
//                           name="role"
//                           required
//                           value={formData.role}
//                           onChange={handleChange}
//                           className="w-full rounded-md border border-zinc-800 bg-black/50 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-transparent transition focus:border-yellow-500/60 focus:ring-yellow-500/20"
//                         >
//                           <option className="bg-zinc-900" value="student">
//                             Current Student
//                           </option>
//                           <option className="bg-zinc-900" value="alumni">
//                             Alumni
//                           </option>
//                         </select>
//                       </div>

//                       <div className="space-y-3">
//                         <label
//                           htmlFor="password"
//                           className="block text-xs font-medium text-zinc-300"
//                         >
//                           Password
//                         </label>
//                         <div className="relative">
//                           <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
//                             <Lock size={14} />
//                           </div>
//                           <Input
//                             id="password"
//                             name="password"
//                             type="password"
//                             autoComplete="new-password"
//                             required
//                             placeholder="Create a password"
//                             className={`pl-9 ${
//                               fieldErrors.password
//                                 ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
//                                 : ""
//                             }`}
//                             value={formData.password}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         {fieldErrors.password && (
//                           <div className="flex items-center gap-2 text-xs text-red-400">
//                             <AlertCircle size={12} />
//                             {fieldErrors.password}
//                           </div>
//                         )}
//                       </div>

//                       <div className="space-y-3">
//                         <label
//                           htmlFor="confirmPassword"
//                           className="block text-xs font-medium text-zinc-300"
//                         >
//                           Confirm Password
//                         </label>
//                         <div className="relative">
//                           <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
//                             <Lock size={14} />
//                           </div>
//                           <Input
//                             id="confirmPassword"
//                             name="confirmPassword"
//                             type="password"
//                             autoComplete="new-password"
//                             required
//                             placeholder="Re-enter your password"
//                             className={`pl-9 ${
//                               fieldErrors.confirmPassword
//                                 ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
//                                 : ""
//                             }`}
//                             value={formData.confirmPassword}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         {fieldErrors.confirmPassword && (
//                           <div className="flex items-center gap-2 text-xs text-red-400">
//                             <AlertCircle size={12} />
//                             {fieldErrors.confirmPassword}
//                           </div>
//                         )}
//                       </div>

//                       <Button
//                         type="submit"
//                         disabled={isLoading}
//                         className="w-full"
//                       >
//                         {isLoading ? (
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
//                         ) : (
//                           "Create Account"
//                         )}
//                       </Button>

//                       <div className="pt-1 text-center text-xs text-zinc-500">
//                         By creating an account, you agree to our Terms of
//                         Service and Privacy Policy.
//                       </div>
//                     </form>
//                   </>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Local styles for floating animation */}
//         <style jsx>{`
//           @keyframes float {
//             0%,
//             100% {
//               transform: translate3d(0, 0, 0);
//             }
//             50% {
//               transform: translate3d(8px, -12px, 0);
//             }
//           }
//           .orb {
//             animation: float 9s ease-in-out infinite;
//           }
//           .orb2 {
//             animation: float 11s ease-in-out infinite;
//           }
//           .orb3 {
//             animation: float 13s ease-in-out infinite;
//           }
//         `}</style>
//       </div>
//     </ProtectedRoute>
//   );
// }

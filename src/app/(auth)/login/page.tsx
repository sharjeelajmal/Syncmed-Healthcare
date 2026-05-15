"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const loginSchema = z.object({
  email: z.string().email({
    message: "Enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const getRedirectPath = (role: string) => {
    if (role === "ADMIN") return "/admin/dashboard"
    if (role === "PROVIDER") return "/provider/dashboard"
    return "/patient/dashboard"
  }

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)

    try {
      // 1. Single Atomic Call: Direct NextAuth ko credentials pass karo
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Access Denied", { description: "Invalid email or password." })
        setIsLoading(false)
        return
      }

      toast.success("Identity Verified", { description: "Connecting to your workspace..." })

      // 2. Fetch the newly created session to get the user's role securely
      const sessionRes = await fetch("/api/auth/session")
      const sessionData = await sessionRes.json()
      const role = sessionData?.user?.role || "PATIENT"

      // 3. Hard redirect to the correct dashboard based on role
      setTimeout(() => {
        window.location.replace(getRedirectPath(role))
      }, 500)

    } catch (err) {
      setIsLoading(false)
      toast.error("System Error", { description: "Authentication failed." })
    }
  }

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#166534] lg:bg-white flex flex-col lg:flex-row overflow-x-hidden selection:bg-green-100">
      
      {/* Mobile Top Branding Area (Only Mobile) */}
      <div className="lg:hidden w-full h-[25vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/login-bg.png"
            alt="Mobile Branding"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#166534]/90 to-[#166534]" />
        </div>
        <div className="relative z-10 animate-in fade-in zoom-in duration-700">
          <img 
            src="/logo.png" 
            alt="SyncMed Logo" 
            className="h-16 w-auto object-contain brightness-0 invert" 
          />
        </div>
      </div>

      {/* Main Form Container (Equal 50% Width on Desktop) */}
      <div className="relative flex-1 lg:w-1/2 bg-white rounded-t-[3rem] lg:rounded-none -mt-12 lg:mt-0 z-20 flex flex-col justify-center p-8 lg:p-16">
        
        <div className="max-w-[440px] w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-left-4 duration-700">
          
          {/* Logo (Desktop Only) */}
          <div className="hidden lg:flex items-center mb-4">
            <img src="/logo.png" alt="SyncMed Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              Welcome Back <span className="text-2xl animate-bounce">🌿</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Sign in to continue to your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-slate-700 font-bold text-[11px] ml-1 uppercase tracking-wider">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            className="h-12 pl-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-green-100 focus:border-green-600 transition-all rounded-xl text-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <div className="flex items-center justify-between ml-1">
                        <FormLabel className="text-slate-700 font-bold text-[11px] uppercase tracking-wider">Password</FormLabel>
                        <Link href="#" className="text-[10px] font-bold text-green-600 hover:text-green-700 transition-colors">Forgot Password?</Link>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                          <Input
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            className="h-12 pl-11 pr-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-green-100 focus:border-green-600 transition-all rounded-xl text-sm"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2 ml-1 pb-1">
                  <Checkbox id="remember" className="size-4 rounded-md border-slate-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                  <label htmlFor="remember" className="text-[11px] font-bold text-slate-600 cursor-pointer select-none">Remember me</label>
                </div>
              </>

              {/* Responsive Button Layout (Side-by-side on Large Screens Only) */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 lg:flex-1 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold text-sm rounded-md transition-all shadow-md active:scale-[0.98] group"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
                
                <div className="flex items-center lg:px-1">
                   <div className="flex-1 lg:hidden border-t border-slate-100" />
                   <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">or continue with</span>
                   <div className="flex-1 lg:hidden border-t border-slate-100" />
                </div>
                
                <Button 
                  variant="outline" 
                  type="button"
                  className="h-12 lg:flex-1 rounded-md border-slate-200 text-sm font-bold gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                  onClick={() => signIn("google")}
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Right Side: Equal 50% Width Branding Section (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-green-950">
        <div className="absolute inset-0 z-0">
          <img
            src="/logorightbg.png"
            alt="Branding Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-transparent to-transparent" />
        </div>

        {/* Content Layer (Positioned Bottom) */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-end p-12 pb-6 text-center">
          <div className="max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 mb-4">
             <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-xl mb-1">
               Build a Better Tomorrow
             </h2>
             <p className="text-white/80 font-medium text-base leading-tight drop-shadow-md">
               Manage, analyze and grow your business with powerful tools and insights.
             </p>
          </div>

          {/* Feature Badges (Compact & Hoverable) */}
          <div className="mt-4 grid grid-cols-3 gap-6 w-full max-w-lg animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
             {[
               { icon: Shield, text: "Secure & Safe" },
               { icon: TrendingUp, text: "Smart Analytics" },
               { icon: Clock, text: "Save Time" }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="size-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center ring-1 ring-white/20 transition-all group-hover:bg-white/30 group-hover:scale-110 shadow-xl">
                     <item.icon className="size-4.5 text-white" />
                  </div>
                  <span className="text-[9px] font-black text-white/90 uppercase tracking-[0.2em] text-center drop-shadow-sm">{item.text}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}

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
import { clearAuthSessionCookiesAction, preLoginCheckAction } from "@/app/actions/auth.actions"

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
      // 1. Secure DB Pre-Check: verify credentials, get MFA state, and fetch the user's role
      const preCheck = await preLoginCheckAction(data.email, data.password)

      if (!preCheck.success) {
        toast.error("Access Denied", { description: preCheck.error || "Invalid email or password." })
        setIsLoading(false)
        return
      }

      // Clear any oversized legacy session cookies (e.g. admin avatar stored in JWT)
      await clearAuthSessionCookiesAction()

      // 2. Perform credential sign-in inside NextAuth to establish the session
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        console.error("Login Result Error:", result.error)
        toast.error("Access Denied", { description: "Invalid email or password." })
        setIsLoading(false)
        return
      }

      toast.success("Identity Verified", { description: "Connecting to your workspace..." })

      // 3. Clean full page redirect based on DB-verified user role (bypasses any session fetch latency/race conditions)
      const role = preCheck.role || "ADMIN"

      if (preCheck.mfaEnabled) {
        window.location.href = `/mfa/verify?email=${encodeURIComponent(data.email)}`
      } else {
        window.location.href = getRedirectPath(role)
      }

    } catch (err) {
      console.error("Client Login Crash:", err)
      setIsLoading(false)
      toast.error("System Error", { description: "Check console for details." })
    }
  }

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#166534] lg:bg-white dark:lg:bg-slate-950 flex flex-col lg:flex-row overflow-x-hidden selection:bg-green-100">

      {/* Mobile Top Branding Area (Only Mobile) */}
      <div className="lg:hidden w-full h-[25vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/logorightbg.png"
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
      <div className="relative flex-1 lg:w-1/2 bg-white dark:bg-slate-900 rounded-t-[3rem] lg:rounded-none -mt-12 lg:mt-0 z-20 flex flex-col justify-center p-8 lg:p-16">

        <div className="max-w-[440px] w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-left-4 duration-700">

          {/* Logo (Desktop Only) */}
          <div className="hidden lg:flex items-center mb-4">
            <img src="/logo.png" alt="SyncMed Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Welcome Back <span className="text-2xl animate-bounce">🌿</span>
            </h1>
            <p className="text-black/70 dark:text-white/70 font-medium text-sm">
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-bold text-[11px] ml-1 uppercase tracking-wider">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            className="h-12 pl-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white focus:dark:bg-slate-950 focus:ring-green-100 focus:border-green-600 transition-all rounded-xl text-sm"
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
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider">Password</FormLabel>
                        <Link href="/forgot-password" className="text-[10px] font-bold text-green-600 hover:text-green-700 transition-colors">Forgot Password?</Link>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                          <Input
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            className="h-12 pl-11 pr-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white focus:dark:bg-slate-950 focus:ring-green-100 focus:border-green-600 transition-all rounded-xl text-sm"
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
                  <Checkbox id="remember" className="size-4 rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                  <label htmlFor="remember" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">Remember me</label>
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
                  <div className="flex-1 lg:hidden border-t border-slate-100 dark:border-slate-800" />
                  <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">or</span>
                  <div className="flex-1 lg:hidden border-t border-slate-100 dark:border-slate-800" />
                </div>

                <Button
                  variant="outline"
                  type="button"
                  asChild
                  className="h-12 lg:flex-1 rounded-md border-slate-200 dark:border-slate-800 text-sm font-bold gap-2 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-[#67BA2E] hover:text-[#67BA2E] transition-all shadow-sm"
                >
                  <Link href="/request-consultation">
                    Get Consultation
                  </Link>
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

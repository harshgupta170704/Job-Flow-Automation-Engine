"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { User } from "@/types";
import {
  Zap,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<{ token: string; user: User }>("/api/auth/register", {
        name,
        email,
        password,
      });
      if (res.data) {
        login(res.data.token, res.data.user);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = password.length >= 6;
  const isConfirmValid = confirmPassword.length > 0 && password === confirmPassword;
  const showConfirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border border-border/80 shadow-2xl overflow-hidden bg-card/95 backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* Left Column: Branding & Feature Highlights */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-8 lg:p-10 flex-col justify-between relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf818_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Top Brand Header */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40 ring-1 ring-white/20">
                  <Zap className="h-5 w-5 text-white fill-white" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-white">JobFlow</span>
                  <span className="block text-[10px] font-semibold tracking-wider uppercase text-blue-400">
                    Automation Platform
                  </span>
                </div>
              </div>

              <div className="mt-10 space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                  Build and scale background jobs effortlessly
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Join developers automating cron schedules, webhooks, and distributed tasks with zero server headache.
                </p>
              </div>

              {/* Highlights List */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Fast Setup</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure your first recurring job in minutes with intuitive forms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Full Observability</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Inspect payload logs, response statuses, and duration metrics on every run.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Automated Retries</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configurable retry counts and delays ensure no failed task is lost.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Trust Badge */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Free Developer Tier</p>
                  <p className="text-[11px] text-slate-400">No credit card required to get started</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div>
              {/* Mobile-only logo */}
              <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                  <Zap className="h-5 w-5 text-white fill-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground">JobFlow</span>
              </div>

              <CardHeader className="p-0 pb-6 space-y-1">
                <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Create an account
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Get started with JobFlow to automate your background workloads
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Alert-style Error Box */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive animate-in fade-in-50 duration-200">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium">{error}</div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        className="pl-9 h-10 transition-all focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="pl-9 h-10 transition-all focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="pl-9 pr-10 h-10 transition-all focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Helpful Password Requirements Indicator */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full flex items-center justify-center text-[10px] transition-colors",
                          isPasswordValid
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isPasswordValid ? <Check className="h-3 w-3" /> : "•"}
                      </div>
                      <span
                        className={cn(
                          "transition-colors",
                          isPasswordValid
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        Must be at least 6 characters
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="pl-9 pr-10 h-10 transition-all focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Confirm password status hint */}
                    {confirmPassword.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <div
                          className={cn(
                            "h-4 w-4 rounded-full flex items-center justify-center text-[10px] transition-colors",
                            isConfirmValid
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-destructive/15 text-destructive"
                          )}
                        >
                          {isConfirmValid ? <Check className="h-3 w-3" /> : "!"}
                        </div>
                        <span
                          className={cn(
                            "transition-colors font-medium",
                            isConfirmValid
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-destructive"
                          )}
                        >
                          {isConfirmValid ? "Passwords match" : "Passwords do not match"}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 font-medium text-sm shadow-sm hover:shadow transition-all mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </div>

            <CardFooter className="p-0 pt-6 mt-6 border-t justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}

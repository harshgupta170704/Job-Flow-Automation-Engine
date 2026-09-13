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
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post<{ token: string; user: User }>("/api/auth/login", {
        email,
        password,
      });
      if (res.data) {
        login(res.data.token, res.data.user);
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border border-border/80 shadow-2xl overflow-hidden bg-card/95 backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
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
                  Orchestrate workflows with confidence
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Reliable background job execution, real-time logging, and automatic failure recovery.
                </p>
              </div>

              {/* Highlights List */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Flexible Job Types</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Schedule HTTP requests, webhooks, data syncs, and custom scripts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Real-Time Observability</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live status tracking, detailed execution logs, and latency metrics.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Resilient & Fault Tolerant</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Idempotent worker execution with exponential retry backoff.
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
                  <p className="text-xs font-semibold text-white">Enterprise Grade Security</p>
                  <p className="text-[11px] text-slate-400">Encrypted credentials & scoped access tokens</p>
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
                  Welcome back
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Enter your credentials to access your JobFlow dashboard
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
                        autoComplete="current-password"
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
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 font-medium text-sm shadow-sm hover:shadow transition-all mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </div>

            <CardFooter className="p-0 pt-6 mt-6 border-t justify-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}

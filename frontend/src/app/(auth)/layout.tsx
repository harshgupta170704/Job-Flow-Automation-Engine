export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-950 overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-sky-400/5 dark:bg-sky-500/10 blur-[140px] pointer-events-none" />

      {/* Subtle modern grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main content container */}
      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center justify-center">
        {children}

        {/* Polished footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JobFlow. Scalable job orchestration & workflow automation.</p>
        </footer>
      </div>
    </div>
  );
}

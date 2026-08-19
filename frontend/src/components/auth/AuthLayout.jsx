import { motion } from "framer-motion";
import Navbar from "../Navbar.jsx";
import Footer from "../Footer.jsx";

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="auth-shell min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-xl2 shadow-[0_10px_40px_-12px_rgba(27,35,67,0.18)] border border-primary/5 p-7 sm:p-9"
        >
          {eyebrow && (
            <p className="text-xs font-semibold tracking-widest uppercase text-accent-dark mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-primary/60 mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

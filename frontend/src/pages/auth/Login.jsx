import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import FormField, { inputClass } from "../../components/auth/FormField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_HOME = {
  user: "/user/dashboard",
  owner: "/owner/dashboard",
  admin: "/admin/dashboard",
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "", remember: true } });

  const onSubmit = async (values) => {
    setSubmitError("");
    toast.dismiss();
    try {
      const user = await login(values);
      toast.success("Welcome back!", { id: "login-success" });
      const redirectTo = location.state?.from?.pathname || ROLE_HOME[user.role] || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err.message || "Could not log in. Please try again.";
      setSubmitError(message);
      toast.error(message, { id: "login-error" });
    }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Log in to your account" subtitle="Find your next PG, faster.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass(errors.email)}
            {...register("email", {
              required: "Email is required.",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
            })}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`${inputClass(errors.password)} pr-11`}
              {...register("password", { required: "Password is required." })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between mb-6 text-sm">
          <label className="flex items-center gap-2 text-primary/70 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-primary/30 text-accent focus:ring-accent/40"
              {...register("remember")}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-accent-dark font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-medium py-2.5 hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-primary/60">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-accent-dark font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

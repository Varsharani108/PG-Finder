import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, User, Building2, Check } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import FormField, { inputClass } from "../../components/auth/FormField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_HOME = {
  user: "/login",
  owner: "/login",
  
};

const ROLES = [
  { value: "user", label: "User", desc: "Looking for a PG or room", icon: User },
  { value: "owner", label: "Owner", desc: "Listing my property", icon: Building2 },
];

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromQuery = searchParams.get("role");
  const initialRole = ["user", "owner"].includes(roleFromQuery) ? roleFromQuery : "user";

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: initialRole,
      terms: false,
    },
  });

  const password = watch("password");

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      const user = await signup(values);
      toast.success("Account created! Welcome to PG Finder.");
      navigate(ROLE_HOME[user.role] || "/", { replace: true });
    } catch (err) {
      setSubmitError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout eyebrow="Get started" title="Create your account" subtitle="Join PG Finder in under a minute.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Full Name" htmlFor="name" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            className={inputClass(errors.name)}
            {...register("name", {
              required: "Full name is required.",
              minLength: { value: 2, message: "Name must be at least 2 characters." },
            })}
          />
        </FormField>

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

        <FormField label="Phone Number" htmlFor="phone" error={errors.phone?.message}>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="9876543210"
            className={inputClass(errors.phone)}
            {...register("phone", {
              required: "Phone number is required.",
              pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit phone number." },
            })}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={`${inputClass(errors.password)} pr-11`}
              {...register("password", {
                required: "Password is required.",
                minLength: { value: 8, message: "Password must be at least 8 characters." },
              })}
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

        <FormField label="Confirm Password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className={`${inputClass(errors.confirmPassword)} pr-11`}
              {...register("confirmPassword", {
                required: "Please confirm your password.",
                validate: (value) => value === password || "Passwords do not match.",
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </FormField>

        <FormField label="I am a..." error={errors.role?.message}>
          <Controller
            name="role"
            control={control}
            rules={{ required: "Please select a role." }}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map(({ value, label, desc, icon: Icon }) => {
                  const active = field.value === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`relative flex flex-col items-center text-center gap-1.5 rounded-lg border px-2 py-3.5 transition-all ${
                        active
                          ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                          : "border-primary/15 hover:border-primary/30"
                      }`}
                    >
                      {active && (
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                          <Check size={11} className="text-primary" strokeWidth={3} />
                        </span>
                      )}
                      <Icon size={20} className={active ? "text-accent-dark" : "text-primary/60"} />
                      <span className="text-xs font-semibold text-primary">{label}</span>
                      <span className="text-[10px] text-primary/50 leading-tight hidden sm:block">{desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </FormField>

        <FormField error={errors.terms?.message}>
          <label className="flex items-start gap-2.5 text-sm text-primary/70 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-primary/30 text-accent focus:ring-accent/40"
              {...register("terms", { required: "You must accept the Terms & Conditions." })}
            />
            I agree to the Terms &amp; Conditions and Privacy Policy.
          </label>
        </FormField>

        {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-medium py-2.5 hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-6 text-center text-sm text-primary/60">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-dark font-medium hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

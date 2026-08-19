import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import FormField, { inputClass } from "../../components/auth/FormField.jsx";
import { resetPasswordRequest } from "../../api/authApi.js";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: "", confirmPassword: "" } });

  const password = watch("password");

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      await resetPasswordRequest({ token, ...values });
      toast.success("Password reset. Please log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      setSubmitError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout eyebrow="Account recovery" title="Set a new password" subtitle="Choose something you'll remember.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="New Password" htmlFor="password" error={errors.password?.message}>
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

        <FormField label="Confirm New Password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
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

        {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-medium py-2.5 hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>

        <p className="mt-6 text-center text-sm text-primary/60">
          <Link to="/login" className="text-accent-dark font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

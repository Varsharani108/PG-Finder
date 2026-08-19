import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import FormField, { inputClass } from "../../components/auth/FormField.jsx";
import { forgotPasswordRequest } from "../../api/authApi.js";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "" } });

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      await forgotPasswordRequest(values);
      setSent(true);
      toast.success("Reset link sent, check your inbox.");
    } catch (err) {
      setSubmitError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="We'll email you a secure link to reset it."
    >
      {sent ? (
        <div className="text-center py-4">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center">
            <MailCheck size={22} className="text-accent-dark" />
          </div>
          <p className="text-sm text-primary/70 mb-6">
            If an account exists for that email, a password reset link is on its way. It expires in 30
            minutes.
          </p>
          <Link to="/login" className="text-accent-dark font-medium hover:underline text-sm">
            Back to login
          </Link>
        </div>
      ) : (
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

          {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-medium py-2.5 hover:bg-primary-light transition-colors disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="mt-6 text-center text-sm text-primary/60">
            Remembered it?{" "}
            <Link to="/login" className="text-accent-dark font-medium hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

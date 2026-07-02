import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/api/supabase/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-[100svh] bg-background flex items-center justify-center px-[clamp(24px,5vw,80px)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm flex flex-col gap-[var(--space-md)]"
        style={{ gap: "32px" }}
      >
        <h1 className="text-h1 font-display font-[400] text-primary leading-[1.05]">
          Sign In
        </h1>

        <div>
          <label
            htmlFor="email"
            className="block mb-[var(--space-xs)] text-label font-sans uppercase tracking-[0.08em] text-muted"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full bg-transparent border-0 border-b border-[#E0DDDA] pb-2 text-base font-sans text-primary font-[300] outline-none transition-colors duration-200 focus:border-[#0F0E0D]"
            style={{ borderBottomWidth: "1px" }}
          />
          {errors.email && (
            <p className="mt-[var(--space-xs)] text-label font-sans uppercase tracking-[0.08em] text-muted">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block mb-[var(--space-xs)] text-label font-sans uppercase tracking-[0.08em] text-muted"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full bg-transparent border-0 border-b border-[#E0DDDA] pb-2 text-base font-sans text-primary font-[300] outline-none transition-colors duration-200 focus:border-[#0F0E0D]"
            style={{ borderBottomWidth: "1px" }}
          />
          {errors.password && (
            <p className="mt-[var(--space-xs)] text-label font-sans uppercase tracking-[0.08em] text-muted">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0F0E0D] text-[#FEFDFC] text-label font-sans uppercase tracking-[0.08em] py-3 hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
          style={{ borderRadius: 0 }}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {error && (
        <p className="text-label font-sans uppercase tracking-[0.08em] text-muted text-center">
          {error}
        </p>
      )}
    </div>
  );
}
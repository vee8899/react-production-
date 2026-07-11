import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/api/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const inviteSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    consent: z.boolean().refine((value) => value, "Consent is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type InviteForm = z.infer<typeof inviteSchema>;

const getInviteLinkError = (location: ReturnType<typeof useLocation>) => {
  const searchParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));

  return (
    searchParams.get("error_description") ||
    hashParams.get("error_description") ||
    searchParams.get("error") ||
    hashParams.get("error")
  );
};

export default function AcceptInvitePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const inviteLinkError = useMemo(() => getInviteLinkError(location), [location]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { consent: false },
  });

  const onSubmit = async (data: InviteForm) => {
    setSubmitError(null);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setSubmitError(error.message);
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || inviteLinkError) {
    return (
      <main className="min-h-[100svh] bg-background flex items-center justify-center px-[clamp(24px,5vw,80px)]">
        <section className="w-full max-w-md flex flex-col gap-6">
          <p className="text-label font-sans uppercase tracking-[0.08em] text-muted">
            Invitation link
          </p>
          <h1 className="text-h1 font-display font-[400] text-primary leading-[1.05]">
            This invite could not be verified
          </h1>
          <p className="text-base font-sans text-muted font-[300]">
            {inviteLinkError ||
              "The invitation may have expired or already been used. Ask the team to send a fresh invite."}
          </p>
          <Link
            to="/login"
            className="inline-flex w-fit bg-[#0F0E0D] text-[#FEFDFC] text-label font-sans uppercase tracking-[0.08em] px-5 py-3 hover:opacity-90 transition-opacity duration-200"
          >
            Back to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-background flex items-center justify-center px-[clamp(24px,5vw,80px)] py-[clamp(40px,8vw,96px)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md flex flex-col gap-7"
      >
        <div className="flex flex-col gap-3">
          <p className="text-label font-sans uppercase tracking-[0.08em] text-muted">
            Client portal invite
          </p>
          <h1 className="text-h1 font-display font-[400] text-primary leading-[1.05]">
            Finish setting up your account
          </h1>
          {user?.email && (
            <p className="text-base font-sans text-muted font-[300]">
              Invited as {user.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block mb-[var(--space-xs)] text-label font-sans uppercase tracking-[0.08em] text-muted"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="block mb-[var(--space-xs)] text-label font-sans uppercase tracking-[0.08em] text-muted"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="w-full bg-transparent border-0 border-b border-[#E0DDDA] pb-2 text-base font-sans text-primary font-[300] outline-none transition-colors duration-200 focus:border-[#0F0E0D]"
            style={{ borderBottomWidth: "1px" }}
          />
          {errors.confirmPassword && (
            <p className="mt-[var(--space-xs)] text-label font-sans uppercase tracking-[0.08em] text-muted">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="flex gap-3 text-sm font-sans text-muted font-[300] leading-6">
            <input
              type="checkbox"
              {...register("consent")}
              className="mt-1 size-4 accent-[#0F0E0D]"
            />
            <span>
              I agree to access the client portal for the invited company and
              understand the account is for authorized workflow reporting.
            </span>
          </label>
          {errors.consent && (
            <p className="mt-[var(--space-xs)] text-label font-sans uppercase tracking-[0.08em] text-muted">
              {errors.consent.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0F0E0D] text-[#FEFDFC] text-label font-sans uppercase tracking-[0.08em] py-3 hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
          style={{ borderRadius: 0 }}
        >
          {isSubmitting ? "Activating..." : "Accept invite"}
        </button>

        {submitError && (
          <p className="text-label font-sans uppercase tracking-[0.08em] text-muted text-center">
            {submitError}
          </p>
        )}
      </form>
    </main>
  );
}

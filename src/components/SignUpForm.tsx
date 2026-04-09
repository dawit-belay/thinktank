"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUp, type AuthActionState } from "@/app/actions";

const initialState: AuthActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white p-3 rounded-lg font-bold hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Creating account..." : "Sign Up"}
    </button>
  );
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

      {state.formError ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" aria-live="polite">
          {state.formError}
        </p>
      ) : null}

      <div className="space-y-4">
        <div>
          <input name="name" placeholder="Full Name" className="w-full p-3 border rounded" />
          {state.fieldErrors?.name ? (
            <p className="mt-1 text-sm text-red-600" aria-live="polite">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <input name="email" type="email" placeholder="Email" className="w-full p-3 border rounded" />
          {state.fieldErrors?.email ? (
            <p className="mt-1 text-sm text-red-600" aria-live="polite">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <input name="password" type="password" placeholder="Password" className="w-full p-3 border rounded" />
          {state.fieldErrors?.password ? (
            <p className="mt-1 text-sm text-red-600" aria-live="polite">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <SubmitButton />
      </div>
    </form>
  );
}

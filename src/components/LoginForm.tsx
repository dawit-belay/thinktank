"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type AuthActionState } from "@/app/actions";

const initialState: AuthActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Signing in..." : "Sign In"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">Login to Thinktank</h1>

      {state.formError ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" aria-live="polite">
          {state.formError}
        </p>
      ) : null}

      <div className="space-y-4">
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded text-black"
          />
          {state.fieldErrors?.email ? (
            <p className="mt-1 text-sm text-red-600" aria-live="polite">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded text-black"
          />
          {state.fieldErrors?.password ? (
            <p className="mt-1 text-sm text-red-600" aria-live="polite">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <SubmitButton />
      </div>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-500 hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}

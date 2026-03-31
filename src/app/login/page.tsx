import { login } from "../actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-zinc-50">
      <form action={login} className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Login to Thinktank</h1>
        
        <div className="space-y-4">
          <input name="email" type="email" placeholder="Email" className="w-full p-3 border rounded text-black" required />
          <input name="password" type="password" placeholder="Password" className="w-full p-3 border rounded text-black" required />
          
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Sign In
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
        </p>
      </form>
    </main>
  );
}
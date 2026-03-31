import { signUp } from "../actions";

export default function SignUpPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-zinc-50">
      <form action={signUp} className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        
        <div className="space-y-4">
          <input name="name" placeholder="Full Name" className="w-full p-3 border rounded" required />
          <input name="email" type="email" placeholder="Email" className="w-full p-3 border rounded" required />
          <input name="password" type="password" placeholder="Password" className="w-full p-3 border rounded" required />
          
          <button type="submit" className="w-full bg-black text-white p-3 rounded-lg font-bold hover:bg-zinc-800">
            Sign Up
          </button>
        </div>
      </form>
    </main>
  );
}
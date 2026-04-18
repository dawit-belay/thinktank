import LoginForm from "@/components/LoginForm";
import { redirectIfSignedIn } from "@/lib/authSession";

export default async function LoginPage() {
  await redirectIfSignedIn();

  return (
    <main className="flex items-center justify-center min-h-screen bg-zinc-50">
      <LoginForm />
    </main>
  );
}
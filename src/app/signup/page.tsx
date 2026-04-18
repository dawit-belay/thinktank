import SignUpForm from "@/components/SignUpForm";
import { redirectIfSignedIn } from "@/lib/authSession";

export default async function SignUpPage() {
  await redirectIfSignedIn();

  return (
    <main className="flex items-center justify-center min-h-screen bg-zinc-50">
      <SignUpForm />
    </main>
  );
}
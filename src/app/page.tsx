import { redirect } from "next/navigation";

import { auth0 } from "@/shared/lib/auth0";

export default async function Page() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/auth/login");
}

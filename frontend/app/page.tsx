import { Metadata } from "next"
import AuthPage from "@/components/auth-page"

export const metadata: Metadata = {
  title: "LLM Hub Personnel",
  description: "Interface unifiée de chatbots",
}

export default function HomePage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <AuthPage />
    </div>
  )
}
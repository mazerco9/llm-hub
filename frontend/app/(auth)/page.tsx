"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          password,
          action: isLogin ? "login" : "register"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue")
      }

      // Stockage du token et redirection
      localStorage.setItem("token", data.token)
      router.push("/chat")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Connexion" : "Inscription"}</CardTitle>
          <CardDescription>
            {isLogin 
              ? "Bienvenue ! Connectez-vous à votre compte." 
              : "Créez un nouveau compte pour commencer."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading 
                ? "Chargement..." 
                : (isLogin ? "Se connecter" : "S'inscrire")}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin 
              ? "Pas de compte ? Inscrivez-vous" 
              : "Déjà un compte ? Connectez-vous"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
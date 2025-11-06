"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate inputs
      if (!name.trim() || !email.trim()) {
        throw new Error("Nome e email sono richiesti")
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Inserisci un indirizzo email valido")
      }

      // Call the /api/leads endpoint
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Errore durante la registrazione")
      }

      // Success: close modal and redirect
      onOpenChange(false)
      window.location.href = "/chatbot"

    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setEmail("")
    setError(null)
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Accedi ad Assitech AI
            </DialogTitle>
            <DialogDescription>
              Inserisci i tuoi dati per iniziare a chattare con il nostro assistente AI
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Nome
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Il tuo nome"
                className="col-span-3"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="la-tua-email@example.com"
                className="col-span-3"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="col-span-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Caricamento..." : "Accedi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

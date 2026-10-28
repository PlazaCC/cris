import { createAuthClient } from 'better-auth/react'

// Mesma origem do site: o handler fica em /api/auth/*
export const authClient = createAuthClient()

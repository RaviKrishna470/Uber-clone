import { useState, type FormEvent } from 'react'

import { Alert, Button, Input } from '@/components/common'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/utils/appError'

export function LoginPage() {
  const signIn = useAuthStore((s) => s.signIn)
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const e164 = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`

  const run = async (fn: () => Promise<void>) => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const requestOtp = (e: FormEvent) => {
    e.preventDefault()
    run(async () => {
      const res = await authService.requestOtp(e164)
      setDevCode(res.dev_code ?? null)
      setStep('otp')
    })
  }

  const verify = (e: FormEvent) => {
    e.preventDefault()
    run(async () => signIn(await authService.verifyOtp(e164, code)))
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={step === 'phone' ? requestOtp : verify}>
        <div className="brand brand-lg">
          RideBook <span>Admin</span>
        </div>
        {step === 'phone' ? (
          <>
            <h2>Sign in</h2>
            <p className="muted">Enter your admin phone number to receive a one-time code.</p>
            <Input
              label="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="90000 00001"
              autoFocus
              inputMode="tel"
            />
            {error && <Alert>{error}</Alert>}
            <Button type="submit" loading={loading} disabled={phone.replace(/\D/g, '').length < 10}>
              Send code
            </Button>
          </>
        ) : (
          <>
            <h2>Enter code</h2>
            <p className="muted">Sent to {e164}</p>
            {devCode && <Alert tone="info">Dev mode (mock OTP): {devCode}</Alert>}
            <Input
              label="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
            />
            {error && <Alert>{error}</Alert>}
            <Button type="submit" loading={loading} disabled={code.length !== 6}>
              Verify &amp; sign in
            </Button>
            <button
              type="button"
              className="link"
              onClick={() => {
                setStep('phone')
                setCode('')
                setError(null)
              }}
            >
              Use a different number
            </button>
          </>
        )}
      </form>
    </div>
  )
}

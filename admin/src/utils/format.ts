export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

/** +919876543210 -> +91 98765 43210 */
export const formatPhone = (e164: string) =>
  e164.startsWith('+91') && e164.length === 13 ? `+91 ${e164.slice(3, 8)} ${e164.slice(8)}` : e164

export const humanize = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())

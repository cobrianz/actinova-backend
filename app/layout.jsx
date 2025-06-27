import './globals.css'

export const metadata = {
  title: 'Actinova ai tutor',
  description: 'Actinova staff',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

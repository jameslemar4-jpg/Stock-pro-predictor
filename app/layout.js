import './globals.css'

export const metadata = {
  title: 'Real-Time Stock Analysis Engine',
  description: 'Multi-factor stock analysis with real-time data',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

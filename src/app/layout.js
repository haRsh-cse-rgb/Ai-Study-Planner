import './globals.css'

export const metadata = {
  title: 'Study Planner',
  description: 'AI powered study planner',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
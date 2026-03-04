export const metadata = {
  title: 'MSAMBWA',
  description: 'Refined pieces for modern living.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
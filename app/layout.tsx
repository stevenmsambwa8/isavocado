import './layout.css';

export const metadata = {
  title: 'MSAMBWA',
  description: 'Refined pieces for modern living.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

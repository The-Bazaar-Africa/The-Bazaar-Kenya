
import LoginClient from './LoginClient';

/**
 * Login Page
 * 
 * Server component that forces dynamic rendering
 * Required because LoginClient uses useSearchParams()
 */
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // Explicitly force dynamic rendering to prevent static generation
  // This is required because the client component uses useSearchParams()

  
  return <LoginClient />;
}

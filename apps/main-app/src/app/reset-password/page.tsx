
import ResetPasswordClient from './ResetPasswordClient';

/**
 * Reset Password Page
 * 
 * Server component that forces dynamic rendering
 * Required because ResetPasswordClient uses useSearchParams()
 */
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  // Explicitly force dynamic rendering to prevent static generation
  // This is required because the client component uses useSearchParams()

  
  return <ResetPasswordClient />;
}

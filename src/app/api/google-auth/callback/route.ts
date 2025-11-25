import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client, storeTokens } from '@/lib/googleOAuth';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '/';

    if (!code) {
        logger.error('Google auth callback error: No code received');
        return NextResponse.redirect(`${appUrl}?error=google_auth_failed`);
    }

    try {
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        
        await storeTokens(tokens);

        // Redirect to the dashboard or a settings page with a success message
        return NextResponse.redirect(`${appUrl}/admin-dashboard-secret?success=google_auth_complete`);

    } catch (error) {
        logger.error('Error exchanging code for tokens', error);
        return NextResponse.redirect(`${appUrl}?error=google_token_exchange_failed`);
    }
}
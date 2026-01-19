import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://inbo-django-api.azurewebsites.net';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[VERIFY-OTP PROXY] Request body:', { 
      email: body.email, 
      otpLength: body.otp?.length,
      hasDeviceInfo: !!body.deviceInfo 
    });
    
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('[VERIFY-OTP PROXY] Response:', { 
      status: response.status,
      success: response.ok,
      hasAccessToken: !!data.accessToken 
    });
    
    if (!response.ok) {
      console.error('[VERIFY-OTP PROXY] Error response:', data);
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[VERIFY-OTP PROXY] Proxy error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function AuthTestPage() {
  const [tokenInfo, setTokenInfo] = useState<{ 
    hasToken: boolean; 
    tokenPreview: string;
    cookies: any;
  } | null>(null);

  useEffect(() => {
    const token = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
    
    setTokenInfo({
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
      cookies: {
        access_token: token ? '✓ Present' : '✗ Missing',
        refresh_token: refreshToken ? '✓ Present' : '✗ Missing',
      }
    });
    
    console.log('🔐 Auth Status:', {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken,
      accessTokenPreview: token?.substring(0, 30),
      refreshTokenPreview: refreshToken?.substring(0, 30),
    });
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔐 Authentication Status</h1>
      
      {tokenInfo && (
        <div className="bg-gray-100 p-6 rounded-lg space-y-4">
          <div>
            <p className="font-semibold">Access Token:</p>
            <p className={`font-mono text-sm ${tokenInfo.hasToken ? 'text-green-600' : 'text-red-600'}`}>
              {tokenInfo.tokenPreview}
            </p>
          </div>
          
          <div>
            <p className="font-semibold">Cookies:</p>
            <ul className="font-mono text-sm space-y-1">
              {Object.entries(tokenInfo.cookies).map(([key, value]) => (
                <li key={key}>
                  <span className={value === '✓ Present' ? 'text-green-600' : 'text-red-600'}>
                    {key}: {value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-4 border-t">
            <button
              onClick={() => {
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                window.location.href = '/auth/login';
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Tokens & Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import emailService from "@/services/email";
import { Bookmark, Clock, Trash2, X } from "lucide-react";

export default function EmailActionsTestPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await emailService.getInboxEmails("latest");
      if (Array.isArray(response)) {
        setEmails(response.slice(0, 5)); // Get first 5 emails
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const logResult = (action: string, emailId: string, success: boolean, error?: any) => {
    const result = {
      action,
      emailId: emailId.substring(0, 8) + '...',
      success,
      error: error?.message || error?.response?.data || null,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testFavorite = async (emailId: string, currentStatus: boolean) => {
    console.log(`📌 Testing FAVORITE: ${emailId}, toggling to ${!currentStatus}`);
    try {
      await emailService.toggleFavorite(emailId, !currentStatus);
      logResult('Toggle Favorite', emailId, true);
      
      // Update local state
      setEmails(prev => prev.map(e => 
        e.id === emailId ? { ...e, isFavorite: !currentStatus } : e
      ));
    } catch (error: any) {
      console.error('❌ Favorite test failed:', error);
      logResult('Toggle Favorite', emailId, false, error);
    }
  };

  const testReadLater = async (emailId: string, currentStatus: boolean) => {
    console.log(`🕐 Testing READ LATER: ${emailId}, toggling to ${!currentStatus}`);
    try {
      await emailService.toggleReadLater(emailId, !currentStatus);
      logResult('Toggle Read Later', emailId, true);
      
      // Update local state
      setEmails(prev => prev.map(e => 
        e.id === emailId ? { ...e, isReadLater: !currentStatus } : e
      ));
    } catch (error: any) {
      console.error('❌ Read Later test failed:', error);
      logResult('Toggle Read Later', emailId, false, error);
    }
  };

  const testTrash = async (emailId: string) => {
    console.log(`🗑️ Testing TRASH: ${emailId}`);
    try {
      await emailService.moveToTrash(emailId);
      logResult('Move to Trash', emailId, true);
      
      // Remove from local state
      setEmails(prev => prev.filter(e => e.id !== emailId));
    } catch (error: any) {
      console.error('❌ Trash test failed:', error);
      logResult('Move to Trash', emailId, false, error);
    }
  };

  const testDelete = async (emailId: string) => {
    console.log(`❌ Testing DELETE: ${emailId}`);
    if (!confirm('This will PERMANENTLY delete the email. Continue?')) {
      return;
    }
    
    try {
      // Assuming delete method exists or using DELETE HTTP method
      await emailService.deleteEmail(emailId);
      logResult('Delete Email', emailId, true);
      
      // Remove from local state
      setEmails(prev => prev.filter(e => e.id !== emailId));
    } catch (error: any) {
      console.error('❌ Delete test failed:', error);
      logResult('Delete Email', emailId, false, error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📧 Email Actions Test Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Test Emails ({emails.length})</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading emails...</div>
          ) : emails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No emails found</div>
          ) : (
            emails.map((email) => (
              <div key={email.id} className="border rounded-lg p-4 space-y-3 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{email.subject}</h3>
                    <p className="text-xs text-gray-500">{email.sender}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {email.id.substring(0, 12)}...</p>
                  </div>
                  
                  <div className="flex gap-2 text-sm">
                    {email.isFavorite && <span className="text-yellow-500">⭐</span>}
                    {email.isReadLater && <span className="text-blue-500">🕐</span>}
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => testFavorite(email.id, email.isFavorite)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium ${
                      email.isFavorite 
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Bookmark size={14} />
                    {email.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  
                  <button
                    onClick={() => testReadLater(email.id, email.isReadLater)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium ${
                      email.isReadLater 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Clock size={14} />
                    {email.isReadLater ? 'Remove' : 'Read Later'}
                  </button>
                  
                  <button
                    onClick={() => testTrash(email.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200"
                  >
                    <Trash2 size={14} />
                    Trash
                  </button>
                  
                  <button
                    onClick={() => testDelete(email.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    <X size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
          
          <button
            onClick={fetchEmails}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Emails
          </button>
        </div>

        {/* Test Results Log */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Results Log</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 h-[600px] overflow-y-auto font-mono text-xs space-y-2">
            {testResults.length === 0 ? (
              <div className="text-gray-400">No tests run yet. Click buttons to test!</div>
            ) : (
              testResults.map((result, idx) => (
                <div key={idx} className={`p-2 rounded ${result.success ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                      {result.success ? '✓' : '✗'} {result.action}
                    </span>
                    <span className="text-gray-500">{result.timestamp}</span>
                  </div>
                  <div className="text-gray-400">Email: {result.emailId}</div>
                  {result.error && (
                    <div className="text-red-400 mt-1">
                      Error: {JSON.stringify(result.error, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <button
            onClick={() => setTestResults([])}
            className="w-full mt-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Clear Log
          </button>
        </div>
      </div>

      {/* API Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">API Endpoints Being Tested:</h3>
        <ul className="text-sm space-y-1 font-mono">
          <li>• PATCH /api/email/{'{email_id}'}/favorite/ - Toggle favorite</li>
          <li>• PATCH /api/email/{'{email_id}'}/readlater/ - Toggle read later</li>
          <li>• PATCH /api/email/{'{id}'}/trash/ - Move to trash (soft delete)</li>
          <li>• DELETE /api/email/{'{id}'}/delete/ - Permanent delete</li>
        </ul>
      </div>
    </div>
  );
}

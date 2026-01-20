// Quick test to check API response structure for email inbox
// Run with: node test-email-response.js

const testInboxAPI = async () => {
  const baseUrl = 'https://inbo-django-api.azurewebsites.net';
  const token = process.env.TEST_TOKEN || 'YOUR_TOKEN_HERE'; // Replace with a valid token
  
  console.log('\n🔍 Testing Inbox API Response Structure...\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/email/inbox/?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n📊 Response structure:', JSON.stringify(data, null, 2).substring(0, 2000));
      
      // Check if data has emails
      if (data.data && Array.isArray(data.data)) {
        console.log(`\n✅ Found ${data.data.length} emails`);
        if (data.data.length > 0) {
          const firstEmail = data.data[0];
          console.log('\n📧 First email fields:');
          console.log('  - id:', firstEmail.id);
          console.log('  - sender:', firstEmail.sender);
          console.log('  - subject:', firstEmail.subject);
          console.log('  - contentPreview:', firstEmail.contentPreview?.substring(0, 50) + '...');
          console.log('  - dateReceived:', firstEmail.dateReceived);
          console.log('  - isRead:', firstEmail.isRead);
          console.log('  - isFavorite:', firstEmail.isFavorite);
          console.log('  - isReadLater:', firstEmail.isReadLater);
          
          // Check for snake_case alternatives
          console.log('\n🔍 Checking for snake_case fields:');
          console.log('  - content_preview:', firstEmail.content_preview);
          console.log('  - date_received:', firstEmail.date_received);
          console.log('  - is_read:', firstEmail.is_read);
          console.log('  - is_favorite:', firstEmail.is_favorite);
          console.log('  - is_read_later:', firstEmail.is_read_later);
        }
      }
    } else {
      console.error('❌ Error:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Failed to fetch:', error.message);
  }
};

testInboxAPI();

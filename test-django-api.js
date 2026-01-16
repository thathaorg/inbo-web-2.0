// Test Django API endpoints directly
const testEndpoint = async (url) => {
  console.log(`\nTesting: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text.substring(0, 200)}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

(async () => {
  const baseUrl = 'https://inbo-django-api.azurewebsites.net';
  
  // Test WITH trailing slash
  await testEndpoint(`${baseUrl}/api/user/analytics/inbox-snapshot/`);
  
  // Test WITHOUT trailing slash
  await testEndpoint(`${baseUrl}/api/user/analytics/inbox-snapshot`);
  
  // Test email inbox WITH trailing slash
  await testEndpoint(`${baseUrl}/api/email/inbox/`);
  
  // Test email inbox WITHOUT trailing slash
  await testEndpoint(`${baseUrl}/api/email/inbox`);
})();

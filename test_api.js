// Quick test script to call the API and see detailed errors
const url = 'https://mlada.in/products/rose-active-tight';

async function testAPI() {
  try {
    console.log('Testing API with URL:', url);
    const response = await fetch('http://localhost:3000/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const contentType = response.headers.get('content-type');
    console.log('\nResponse Status:', response.status);
    console.log('Content-Type:', contentType);
    
    const text = await response.text();
    console.log('\nResponse Body (first 2000 chars):');
    console.log(text.substring(0, 2000));
    
    if (contentType?.includes('application/json')) {
      try {
        const data = JSON.parse(text);
        console.log('\nParsed JSON:');
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {
        console.error('\nFailed to parse JSON:', e.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();

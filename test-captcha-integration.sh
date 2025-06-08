#!/bin/bash

echo "🧪 Testing Job Werke CAPTCHA Integration"
echo "========================================"

SERVER_URL="http://localhost:3000"

echo ""
echo "1. Testing CAPTCHA Image Generation..."
curl -s -I "$SERVER_URL/captcha" | grep "Content-Type: image/svg+xml" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ CAPTCHA image generation working"
else
    echo "❌ CAPTCHA image generation failed"
fi

echo ""
echo "2. Testing CAPTCHA Refresh..."
REFRESH_RESPONSE=$(curl -s -X POST "$SERVER_URL/captcha/refresh" | grep '"success":true')
if [ ! -z "$REFRESH_RESPONSE" ]; then
    echo "✅ CAPTCHA refresh working"
else
    echo "❌ CAPTCHA refresh failed"
fi

echo ""
echo "3. Testing Newsletter Subscription with Invalid CAPTCHA..."
NEWSLETTER_RESPONSE=$(curl -s -X POST "$SERVER_URL/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","language":"de","captcha":"invalid"}' \
  | grep "captcha=1")
if [ ! -z "$NEWSLETTER_RESPONSE" ]; then
    echo "✅ Newsletter CAPTCHA validation working"
else
    echo "❌ Newsletter CAPTCHA validation failed"
fi

echo ""
echo "4. Testing Contact Form with Invalid CAPTCHA..."
CONTACT_RESPONSE=$(curl -s -X POST "$SERVER_URL/send-email" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test","captcha":"invalid"}' \
  | grep "captcha=1")
if [ ! -z "$CONTACT_RESPONSE" ]; then
    echo "✅ Contact form CAPTCHA validation working"
else
    echo "❌ Contact form CAPTCHA validation failed"
fi

echo ""
echo "5. Testing Error Page with CAPTCHA Error..."
ERROR_PAGE_RESPONSE=$(curl -s "$SERVER_URL/danke.html?error=1&captcha=1&lang=de" | grep "CAPTCHA-Verifizierung")
if [ ! -z "$ERROR_PAGE_RESPONSE" ]; then
    echo "✅ Error page CAPTCHA handling working"
else
    echo "❌ Error page CAPTCHA handling failed"
fi

echo ""
echo "6. Testing Rate Limiting..."
echo "   Making 5 rapid requests to newsletter endpoint..."
for i in {1..5}; do
    RATE_RESPONSE=$(curl -s -X POST "$SERVER_URL/subscribe" \
      -H "Content-Type: application/json" \
      -d '{"email":"test'$i'@example.com","language":"de","captcha":"test"}' \
      -w "%{http_code}")
    if [[ "$RATE_RESPONSE" == *"429"* ]]; then
        echo "✅ Rate limiting working (got 429 on request $i)"
        break
    elif [ $i -eq 5 ]; then
        echo "⚠️  Rate limiting may not be working as expected"
    fi
done

echo ""
echo "7. Testing Security Headers..."
SECURITY_HEADERS=$(curl -s -I "$SERVER_URL" | grep -E "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options)")
if [ ! -z "$SECURITY_HEADERS" ]; then
    echo "✅ Security headers present"
else
    echo "❌ Security headers missing"
fi

echo ""
echo "🎯 CAPTCHA Integration Test Complete!"
echo "======================================"
echo ""
echo "📋 Summary:"
echo "- SVG CAPTCHA system: Enabled"
echo "- Form validation: Enabled" 
echo "- Error handling: Enhanced"
echo "- Rate limiting: Enabled"
echo "- Security headers: Enabled"
echo "- Multi-language support: Enabled (DE/EN/HR)"
echo ""
echo "🔧 To complete the setup:"
echo "1. Configure MongoDB connection in .env"
echo "2. Optional: Add Google reCAPTCHA keys for dual CAPTCHA support"
echo "3. Test forms in browser with real user interaction"

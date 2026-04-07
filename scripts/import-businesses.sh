#!/bin/bash

# WilCo Guide - Business Data Bulk Import Script
# This script imports all 12 businesses via the Payload CMS REST API

set -e

# Configuration
CMS_URL="http://localhost:3000/api"
COLLECTION="businesses"
JSON_FILE="./BUSINESS_DATA_COMPLETE.json"

echo "🚀 Starting business data import..."
echo "📍 CMS URL: $CMS_URL"
echo "📋 JSON File: $JSON_FILE"

# Check if JSON file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "❌ Error: JSON file not found at $JSON_FILE"
    exit 1
fi

# Check if CMS is running
echo ""
echo "🔍 Checking if CMS is running..."
CMS_CHECK=$(curl -s -I "$CMS_URL" | head -1)
echo "📡 CMS Response: $CMS_CHECK"

if ! echo "$CMS_CHECK" | grep -q "200\|404\|401"; then
    echo "❌ Error: CMS is not responding. Make sure Payload CMS is running with: npm run dev"
    exit 1
fi
echo "✅ CMS is running!"
echo ""

# Get total number of businesses
TOTAL=$(jq 'length' "$JSON_FILE")
echo "📊 Found $TOTAL businesses to import"

SUCCESS_COUNT=0
ERROR_COUNT=0

# Read JSON and loop through businesses
jq -c '.[]' "$JSON_FILE" | while IFS= read -r business; do
    BUSINESS_NAME=$(echo "$business" | jq -r '.name')
    
    echo ""
    echo "⏳ Importing: $BUSINESS_NAME..."
    
    # Make API request to create business
    RESPONSE=$(curl -s -X POST "$CMS_URL/$COLLECTION" \
        -H "Content-Type: application/json" \
        -d "$business")
    
    # Debug output
    echo "Response: $RESPONSE" >&2
    
    # Check if response contains ID (success)
    if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        ID=$(echo "$RESPONSE" | jq -r '.id')
        echo "✅ Successfully imported: $BUSINESS_NAME (ID: $ID)"
        ((SUCCESS_COUNT++))
    else
        ERROR=$(echo "$RESPONSE" | jq -r '.message // .error // "Unknown error"')
        echo "❌ Error importing $BUSINESS_NAME: $ERROR"
        ((ERROR_COUNT++))
    fi
done

# Print summary
echo ""
echo "============================================================"
echo "📊 IMPORT SUMMARY"
echo "============================================================"
echo "✅ Successfully imported: $SUCCESS_COUNT"
echo "❌ Failed imports: $ERROR_COUNT"
echo "📊 Total: $TOTAL"
echo "============================================================"
echo "✨ Import process completed!"

# Exit with appropriate code
if [ $ERROR_COUNT -eq 0 ]; then
    exit 0
else
    exit 1
fi

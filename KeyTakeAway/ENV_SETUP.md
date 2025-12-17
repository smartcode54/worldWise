# Environment Variables Setup Guide

This project uses environment variables to store sensitive credentials and configuration. All API keys and URLs should be stored in a `.env` file.

## Quick Setup

1. **Create a `.env` file** in the root directory of the project
2. **Copy the template below** and fill in your actual values
3. **Restart your development server** after creating/updating `.env`

## Environment Variables Template

Create a `.env` file with the following content:

```env
# Geoapify API Key
# Get your API key from: https://www.geoapify.com/get-started-with-maps-api
# This key is used for:
# - Map tiles (Map component)
# - Reverse geocoding (Form component)
VITE_GEOAPIFY_API_KEY=your-geoapify-api-key-here

# Geoapify Map Style (optional)
# Available styles: osm-bright, osm-bright-grey, dark-matter, positron, klokantech-basic, osm-liberty
# Default: osm-bright
# See more at: https://apidocs.geoapify.com/docs/maps/
VITE_GEOAPIFY_MAP_STYLE=osm-bright

# Database URL (optional)
# Default: http://localhost:8000
# Change this if your JSON server runs on a different port or URL
VITE_DATABASE_URL=http://localhost:8000
```

## Required Variables

### `VITE_GEOAPIFY_API_KEY` (Required)
- **Purpose**: Used for Geoapify map tiles and reverse geocoding
- **Where to get it**: [Geoapify Get Started](https://www.geoapify.com/get-started-with-maps-api)
- **Used in**:
  - `src/components/Map.jsx` - For map tiles
  - `src/components/Form.jsx` - For reverse geocoding (getting city name from coordinates)

## Optional Variables

### `VITE_GEOAPIFY_MAP_STYLE` (Optional)
- **Purpose**: Choose the map tile style
- **Default**: `osm-bright`
- **Available options**:
  - `osm-bright` - Bright OpenStreetMap style (default)
  - `osm-bright-grey` - Grey OpenStreetMap style
  - `dark-matter` - Dark theme
  - `positron` - Light theme
  - `klokantech-basic` - Basic style
  - `osm-liberty` - Liberty style
- **Used in**: `src/components/Map.jsx`

### `VITE_DATABASE_URL` (Optional)
- **Purpose**: JSON server URL for local development
- **Default**: `http://localhost:8000`
- **Used in**: `src/contexts/CitiesContext.jsx`

## Important Notes

1. **Never commit `.env` to version control** - It's already in `.gitignore`
2. **Restart dev server** - Environment variables are loaded at build time, so restart after changes
3. **Vite prefix required** - All environment variables must start with `VITE_` to be accessible in the browser
4. **No quotes needed** - Don't wrap values in quotes in `.env` file

## Example `.env` File

```env
VITE_GEOAPIFY_API_KEY=e55a183b7d8749748a1832193dd86c74
VITE_GEOAPIFY_MAP_STYLE=osm-bright
VITE_DATABASE_URL=http://localhost:8000
```

## Troubleshooting

### Map not loading?
- Check that `VITE_GEOAPIFY_API_KEY` is set correctly
- Verify the API key is valid at [Geoapify Dashboard](https://myprojects.geoapify.com/)
- Restart your development server

### Reverse geocoding not working?
- Ensure `VITE_GEOAPIFY_API_KEY` is set
- Check browser console for error messages
- Verify API key has geocoding permissions enabled

### Environment variable not working?
- Make sure variable name starts with `VITE_`
- Restart the development server after adding/updating `.env`
- Check for typos in variable names
- Ensure `.env` file is in the project root directory

## Security Best Practices

1. ✅ **Use `.env` for all credentials** - Never hardcode API keys
2. ✅ **Add `.env` to `.gitignore`** - Already configured
3. ✅ **Use different keys for development/production** - Create separate `.env` files
4. ✅ **Don't share your `.env` file** - Keep it private
5. ✅ **Rotate keys regularly** - Update API keys periodically

## Getting Your Geoapify API Key

1. Visit [Geoapify Get Started](https://www.geoapify.com/get-started-with-maps-api)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Add it to your `.env` file as `VITE_GEOAPIFY_API_KEY`

## Free Tier Limits

Geoapify offers a free tier with:
- 3,000 requests/day for map tiles
- 3,000 requests/day for geocoding
- Perfect for development and small projects

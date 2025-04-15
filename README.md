# ID Card Generator 2.0

A web application for generating and managing ID cards with Firebase integration.

## Features

- Create and customize ID cards
- Automatic registration number generation
- Firebase backend for data storage
- Image upload and processing
- Print-ready ID card output

## Project Structure

- `index.html` - Main application interface
- `style.css` - Styling for the application
- `script.js` - Main application logic
- `refresh.js` - Handles page refreshing and cache management
- `firebase-config.js` - Firebase configuration (not tracked in git for security)

## Setup

1. Clone this repository
2. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
3. Create a `firebase-config.js` file with your Firebase credentials (this file is gitignored for security)
4. Set up your Firebase configuration by following these steps:
   - Go to your Firebase project settings
   - Find the 'Your apps' section and copy the configuration
   - Add the configuration to your `firebase-config.js` file
   - Initialize the Firebase services (Firestore, Auth, Storage) as needed

5. Open `index.html` in your browser or deploy to a web server

## Registration Counter

The application uses a Firestore counter to generate sequential registration numbers. If you need to reset the counter:

1. Uncomment the reset function call in `firebase-config.js`
2. Refresh the page once
3. Comment the line again to prevent multiple resets

## Browser Compatibility

Tested and working on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Author

Rhythm Jain

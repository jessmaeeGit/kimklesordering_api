# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This project supports deployment to multiple platforms:

#### 🚂 Railway Deployment (Recommended - Easiest)

Railway is the simplest way to deploy - no server management needed!

**Separate Services Setup (Recommended):**
- 📖 **[Separate Services Guide](RAILWAY_SEPARATE_SERVICES.md)** - Deploy API and Frontend separately
- Deploys as **two separate services** for better scaling and independent deployments

**Railway Benefits:**
- ✅ No server management
- ✅ Automatic SSL certificates
- ✅ Git-based deployments
- ✅ Built-in monitoring
- ✅ Free tier available
- ✅ Independent scaling for API and Frontend

**Railway Files:**
- `nixpacks.toml` - Frontend service configuration
- `server/nixpacks.toml` - API server service configuration

#### 🐳 Digital Ocean Deployment

For full control over your server:

- 📖 **[Full Deployment Guide](DEPLOYMENT.md)** - Complete step-by-step instructions
- ⚡ **[Quick Start Guide](QUICK_START.md)** - Condensed version for quick reference

**Digital Ocean Files:**
- `ecosystem.config.js` - PM2 process manager configuration
- `deploy.sh` - Automated deployment script
- `nginx.conf.example` - Nginx reverse proxy configuration template

#### Environment Variables

Create a `.env` file in the root directory with the following variables:
- `NODE_ENV=production`
- `PORT=5000` or `SERVER_PORT=5000`
- `NOTIFICATIONAPI_CLIENT_ID`
- `NOTIFICATIONAPI_CLIENT_SECRET`
- `MOVIDER_APIKEY`
- `MOVIDER_APISECRET`
- `REACT_APP_PAYPAL_CLIENT_ID`
- `REACT_APP_API_BASE` (your production URL)
- `REACT_APP_GEOAPIFY_KEY`

**For Railway:** Set these in the Railway dashboard under Variables tab.
**For Digital Ocean:** Create a `.env` file on your server.

See the respective deployment guides for detailed instructions.

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

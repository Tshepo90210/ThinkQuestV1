# Deploying Your ThinkQuest Project to Render

This guide provides step-by-step instructions for deploying your ThinkQuest application on Render. These instructions are tailored to your project's specific setup.

## Prerequisites

1.  **GitHub Repository**: Your project code, including all the recent changes we made, must be pushed to a GitHub repository.
2.  **Render Account**: You need an account on [Render](https://render.com/). You can sign up with your GitHub account.
3.  **PocketBase Instance**: Your application requires a running PocketBase instance. If you're only using it for this project, you can get a free one at a service like [PocketHost](https://pockethost.io/).
3.  **OpenAI API Key**: You need an OpenAI API key for the generative AI features. You can get one from [OpenAI](https://platform.openai.com/account/api-keys).

---

## Deployment Steps

### 1. Create a New Web Service on Render

- Log in to your Render dashboard.
- Click the **New +** button and select **Web Service**.

### 2. Connect Your GitHub Repository

- If you haven't already, connect your GitHub account to Render.
- Select the GitHub repository for your ThinkQuest project.

### 3. Configure the Web Service

On the configuration screen, fill in the details as follows. This is the most important step.

- **Name**: Give your service a name (e.g., `thinkquest-app`).
- **Region**: Choose a region close to you.
- **Branch**: Select your main branch (e.g., `main` or `master`).
- **Root Directory**: `thinkquest-canvas-main`
  - *This tells Render to run all commands from within your project's subfolder.*
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free` is sufficient for this project.

### 4. Add Environment Variables

- Before creating the service, scroll down to the **Advanced** section.
- Click **Add Environment Variable** for each of the following keys and paste in your corresponding secret values.

| Key | Value | Description |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | `your_openai_api_key_here` | Your secret API key for OpenAI. |
| `VITE_POCKETBASE_URL` | `your_pockethost_url_here` | The full URL to your live PocketBase instance. |
| `NODE_VERSION` | `20.11.1` | Specifies the version of Node.js to use. |

**Important**: Ensure the keys match exactly, as they are case-sensitive.

### 5. Deploy

- Click the **Create Web Service** button at the bottom of the page.
- Render will now start the first deployment. You can watch the progress in the deploy logs. The first build may take several minutes.

---

## After Deployment

Once the deployment is complete, your application will be live at the URL provided by Render (e.g., `https://thinkquest-app.onrender.com`).

- **Logs**: If you encounter any errors, the first place to look is the **Logs** tab in your Render service dashboard.
- **Auto-Deploys**: By default, Render will automatically redeploy your application every time you push a new commit to your connected GitHub branch.

You have successfully deployed your application!

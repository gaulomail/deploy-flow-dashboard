# Deploy Flow Dashboard

Deploy Flow Dashboard is a web application designed to streamline and manage software deployments. It provides an interface to select repositories, branches, and environments, and to monitor the deployment process.

## Prerequisites

Before you begin, ensure you have the following installed on your system and have obtained the necessary API keys:

**Software:**
*   **Node.js:** (LTS version recommended, e.g., v18 or v20). You can download it from [nodejs.org](https://nodejs.org/).
*   **npm:** (Node Package Manager) This is usually installed with Node.js.
*   **Docker:** Docker Desktop is recommended for macOS and Windows. For Linux, install Docker Engine and Docker Compose.
    *   **Install Docker:** Follow the official instructions at [docs.docker.com/get-docker/](https://docs.docker.com/get-docker/).
    *   Ensure Docker Compose is also available (usually included with Docker Desktop).

**API Keys and Access Tokens:**
*   **GitHub Personal Access Token:** Required for the backend to interact with GitHub repositories. This token needs appropriate permissions (e.g., `repo` scope).
*   **Google Generative AI (Gemini) API Key:** Required for the frontend's "Alice" chatbot functionality.


Detailed setup instructions for these keys are in the "Environment Setup" section.

## How to Use the Application

Once the application is running (either via Docker Compose or by running services individually), you can use the Deploy Flow Dashboard as follows:

1.  **Access the Dashboard:**
    *   Open your web browser and navigate to the frontend URL. If using Docker Compose, this is typically `http://localhost:80` (or `http://localhost`). If running the frontend development server, it might be `http://localhost:5173` (check your console output).

2.  **Making a Deployment (Deploy Tab):**
    *   The main interface defaults to the "Deploy" tab.
    *   **Choose Repository:** Select the GitHub repository you want to deploy from the dropdown list. The list should populate based on the access provided by your `GITHUB_TOKEN`.
    *   **Choose Branch:** Once a repository is selected, choose the specific branch you wish to deploy.
        *   Details about the selected branch, such as the last commit message, author, and date, will be displayed below the dropdown.
    *   **Pick Staging Environment:** Select the target environment for your deployment (e.g., `staging-1`, `ubt`).
    *   **Deploy Now:** Click the "Deploy Now" button. This will initiate the deployment process.

3.  **Monitoring Deployment (Steps Tab):**
    *   After initiating a deployment, the interface may automatically switch to the "Steps" tab, or you can click on it manually.
    *   This tab shows the progress of the current deployment through various stages (e.g., "Preparing deployment", "Building application", "Running tests", "Deploying to environment", "Health checks").
    *   Each step will display its status (e.g., pending, running, completed, failed).
    *   A progress bar at the bottom of the "Deploy" tab (when a deployment is active) also shows the overall deployment progress.

4.  **Reviewing Deployment History (Logs Tab):**
    *   Click on the "Logs" tab to view a history of past deployments.
    *   Each log entry typically shows the user who initiated the deployment, timestamp, branch, environment, and the final status (success, failed).

5.  **Using the Alice Chatbot:**
    *   At the bottom of the page, you'll find the "Alice Chatbot".
    *   You can interact with Alice by typing messages in the chat input.
    *   Alice can provide assistance or even help you initiate deployments. For example, you might be able to say: "Deploy feature-xyz to staging-2".
    *   Ensure your `VITE_GEMINI_API_KEY` is correctly set up in the frontend's `.env` file for the chatbot to function.

6.  **Configuring Settings:**
    *   Click on the **Settings icon** (usually a cogwheel) in the header of the application.
    *   This will open a settings panel where you might be able to configure application preferences or manage API keys directly in the UI if this functionality is built out (Note: Critical keys like `GITHUB_TOKEN` and `VITE_GEMINI_API_KEY` are primarily managed via `.env` files for security in production).

7.  **Deployment Locking:**
    *   The interface includes functionality for deployment locking. If a deployment is locked (e.g., by another critical deployment), the "Deploy Now" button might be disabled or replaced by a "Release Lock" button, along with a reason for the lock.

## Project Structure
The project is a monorepo consisting of two main parts:

*   `deploy-flow-backend/`: The backend service built with Fastify. It handles API requests, interacts with GitHub, and manages deployment logic.
*   `deploy-flow-frontend/`: The frontend user interface built with React (Vite) and TypeScript. It allows users to interact with the deployment system.

## Environment Setup

The application requires certain environment variables to function correctly.

### Backend (`deploy-flow-backend/.env`)

1.  Navigate to the backend directory:
    ```bash
    cd deploy-flow-backend
    ```
2.  Create a `.env` file by copying the example if one exists, or create it manually.
    ```bash
    # If you have an .env.example:
    # cp .env.example .env
    # Otherwise, create a new file:
    # touch .env
    ```
3.  Add the following required environment variables to your `deploy-flow-backend/.env` file:

    ```env
    GITHUB_TOKEN=your_github_personal_access_token
    # Add any other backend-specific environment variables here
    # E.g., API_PORT=3000 (if you need to override the default)
    ```
    *   `GITHUB_TOKEN`: This is your GitHub Personal Access Token with appropriate permissions (e.g., `repo` scope) to access repository information, branches, and potentially trigger workflows.

### Frontend (`deploy-flow-frontend/.env`)

1.  Navigate to the frontend directory:
    ```bash
    cd deploy-flow-frontend
    ```
2.  Create a `.env` file if it doesn't exist:
    ```bash
    touch .env
    ```
3.  Add the following required environment variables to your `deploy-flow-frontend/.env` file:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key
    # Add any other frontend-specific environment variables here, e.g.:
    # VITE_API_BASE_URL=http://localhost:3000 
    ```
    *   `VITE_GEMINI_API_KEY`: This is your Google Generative AI (Gemini) API Key, used for the Alice chatbot.
    *   `VITE_API_BASE_URL` (Optional): If you run the frontend and backend separately in development, you might need to set this to point to your backend API (e.g., `http://localhost:3000`).

### Docker Compose Root `.env` (Optional but Recommended)

For the Dockerized setup using `docker-compose.yml`, the `GITHUB_TOKEN` is passed to the backend service. It's good practice to place this in a `.env` file in the project root directory (`/Users/gaudencio/Desktop/deploy-flow-dashboard/.env`). Docker Compose will automatically load this file.

1.  In the project root, create a `.env` file:
    ```bash
    touch .env 
    ```
2.  Add your GitHub token:
    ```env
    # /Users/gaudencio/Desktop/deploy-flow-dashboard/.env
    GITHUB_TOKEN=your_github_personal_access_token
    ```
    If you don't use a root `.env` file, ensure `GITHUB_TOKEN` is exported in your shell environment when running `docker-compose up`.

## Running the Application (Docker Compose - Recommended)

This is the easiest way to get the entire application (frontend and backend) running.

1.  **Ensure Docker is running.**
2.  **Set up Environment Variables for Docker Compose:**
    The `docker-compose.yml` expects `GITHUB_TOKEN` to be available. You can:
    *   Export it in your shell: `export GITHUB_TOKEN="your_github_personal_access_token"`
    *   Or, create a `.env` file in the project root (`/Users/gaudencio/Desktop/deploy-flow-dashboard/.env`) and add:
        ```env
        GITHUB_TOKEN=your_github_personal_access_token
        ```
    Also, ensure the backend's `.env` file (`deploy-flow-backend/.env`) is created as described in the "Environment Setup" section, as it's mounted into the container.

3.  **Build and Run with Docker Compose:**
    From the project root directory (`/Users/gaudencio/Desktop/deploy-flow-dashboard`), run:
    ```bash
    docker-compose up --build
    ```
    *   The `--build` flag ensures the images are built fresh if there are changes.
    *   To run in detached mode (in the background), use `docker-compose up --build -d`.

4.  **Access the application:**
    *   **Frontend:** [http://localhost:80](http://localhost:80) (or `http://localhost` as port 80 is the default for HTTP)
    *   **Backend API:** [http://localhost:3000](http://localhost:3000)

5.  **To stop the application:**
    *   If running in the foreground, press `Ctrl+C`.
    *   If running in detached mode, use `docker-compose down`.

## Running Services Individually (for Development)

If you prefer to run the frontend and backend services separately for development (e.g., for faster hot-reloading and direct debugging):

### 1. Backend Service

1.  Navigate to the backend directory:
    ```bash
    cd deploy-flow-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure your `deploy-flow-backend/.env` file is set up as described in the "Environment Setup" section.
4.  Start the backend development server:
    ```bash
    npm run dev
    ```
    The backend will typically be available at `http://localhost:3000` (or as configured by Fastify).

### 2. Frontend Service

1.  Navigate to the frontend directory:
    ```bash
    cd deploy-flow-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  (Optional) If the frontend requires specific environment variables (e.g., `VITE_API_BASE_URL` to point to your local backend at `http://localhost:3000`), create or update the `.env` file in this directory. For example:
    ```env
    # deploy-flow-frontend/.env
    VITE_API_BASE_URL=http://localhost:3000
    ```
4.  Start the frontend development server:
    ```bash
    npm run dev:client
    ```
    The frontend will usually be available at `http://localhost:5173` (or another port specified by Vite in the console output).

## Building for Production (Manual)

While Docker handles the build for the combined deployment, you can also build the services individually:

*   **Frontend:**
    ```bash
    cd deploy-flow-frontend
    npm run build
    ```
    The production-ready static assets will be placed in the `deploy-flow-frontend/dist` directory.

*   **Backend:**
    The backend (Fastify) doesn't typically have a separate "build" step like static frontends. `npm install` installs dependencies, and the `Dockerfile` copies the necessary files. The `npm start` script is used to run it in a production-like mode.

---

Happy Deploying!

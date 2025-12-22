# LitClub

LitClub is a chapter-based social reading and book discussion platform developed as part of Purdue CS 307.

## Contributions (Brayden Reimann)
- Owned backend architecture and domain modeling
- Designed and implemented 30+ REST API endpoints
- Led frontend-backend data integration
- Applied production-grade API design patterns (REPR, RESTful conventions)

## Tech Stack:
- Frontend: React Native (Expo; iOS, Android)
- Backend: ASP.NET Core Web API (.NET 8), Azure Cosmos DB
- Infrastructure: Docker, Cosmos DB Emulator, Azurite
- Tooling: OpenAPI client generation

Below are the instructions for running the project locally.

## LitClub Setup Instructions
### 1. Install Required Dependencies

#### 1. Install Node.js
Visit [nodejs.org](https://nodejs.org/en/download) and follow the installation instructions for your operating system. Choose the **LTS (Long-Term Support)** version.

#### 2. Install Git
Download and install Git from [git-scm.com/downloads](https://git-scm.com/downloads). Follow the installation wizard for your OS.

#### 3. Install .NET 8 LTS
LitClub’s backend is built on **.NET 8 (Long-Term Support)**.

Download and install it from the official Microsoft website:  
[https://dotnet.microsoft.com/en-us/download/dotnet/8.0](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)

After installation, verify it with:
```bash
dotnet --version
```
You should see a version beginning with `8.` (e.g., `8.0.303`).

#### 4. Install VS Code and C# Extensions
Download **VS Code** from [code.visualstudio.com](https://code.visualstudio.com/) and follow the setup instructions for your operating system.

##### Recommended Extensions
Once VS Code is installed, open it and install the following extensions:
1. **C# Dev Kit** (Microsoft)  
   Provides a full-featured C# development environment.
3. **C#** (Microsoft)  
   Adds language support, syntax highlighting, and IntelliSense for C#.

#### 5. Install the Expo Go App
Download **Expo Go** on your smartphone (from the iOS App Store or Google Play). You’ll use it to preview and test the app during development.

---

### 2. Clone the LitClub Repository
Navigate to your desired directory and run:
```powershell
git clone git@github.com:braydenreimann/LitClub.git
```

---

### 3. Run the Expo App*
1. Navigate to the frontend:
   ```bash
   cd LitClub/frontend
   ```
2. Install dependencies:*
   ```bash
   npm install
   npm i openapi-fetch
   npm i -D openapi-typescript typescript
   ```
3. Start the app:
   ```bash
   npx expo start
   ```
Follow the on-screen instructions to open the app in Expo Go.

---

## 4. Set Up the Cosmos DB Emulator and Azurite Emulator (for the API Backend)

These emulators let you run the LitClub API locally without connecting to Azure.

### 1. Install Docker

#### macOS
1. Install **Docker Desktop for Mac** from [Docker’s site](https://www.docker.com/products/docker-desktop/).
2. Start Docker Desktop.
3. Verify installation:
   ```bash
   docker --version
   ```

#### Windows
1. Install **Docker Desktop for Windows** from [Docker’s site](https://www.docker.com/products/docker-desktop/).
2. Start Docker Desktop.
3. Enable **WSL 2 backend** when prompted.
4. Verify installation:
   ```powershell
   docker --version
   ```

---

### 2. Pull the Cosmos DB Emulator Image
Before running the command below, make sure you have the Docker Desktop application open.

```bash
docker pull mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:vnext-preview
```
---

### 3. Run the Cosmos DB Emulator
```bash
docker run --detach --publish 8081:8081 --publish 1234:1234 --name cosmos-emulator mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:vnext-preview --protocol https
```

Open [http://localhost:1234](http://localhost:1234) to view the interactive database explorer.

Any time you remove the `cosmos-emulator` container from Docker, you will have to run this command again to initialize the container.

---

### 4. Run the Azurite Emulator

```bash
docker run -p 10000:10000 mcr.microsoft.com/azure-storage/azurite
    azurite-blob --blobHost 0.0.0.0 --blobPort 10000
```

### 5. Configure the LitClub API Client
Navigate to the backend (`LitClub/backend/LitClubApi`). In `Program.cs`, confirm this setup:

```csharp
// Configure the client's options to disable TSL/SSL validation before creating the client
CosmosClientOptions options = new()
{
    HttpClientFactory = () => new HttpClient(new HttpClientHandler()
    {
        ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    }),
    ConnectionMode = ConnectionMode.Gateway
};

// Create a new instance of CosmosClient using the emulator's credentials
using CosmosClient client = new(
    accountEndpoint: "https://localhost:8081",
    authKeyOrResourceToken: "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==",
    clientOptions: options
);
```

---

### 7. Emulator Management
```bash
docker stop cosmos-emulator
docker start cosmos-emulator
docker rm cosmos-emulator
```

You can run these commands in the terminal to stop, start, and remove the `cosmos-emulator` container. You can also do this using the GUI interface of the Docker Desktop application.

You only need to start the container once per local development session, as the container keeps running in the background until you stop it or shut down your machine.

When you're done for the day, or don't need the backend anymore, you should stop the container to free up system resources again.

---

### 8. Run the API
1. Navigate to the backend:
   ```bash
   cd LitClub/backend/LitClubApi
   ```
2. Restore and build dependencies:
   ```bash
   dotnet restore
   dotnet build
   ```
3. Run the API:
   ```bash
   dotnet run
   ```

You should see a successful API connection string in your console log. A window should also open in your default browser with an explorer for viewing and interacting with the LitClubApi endpoints.

You can also run the API by navigating to `LitClub/backend/LitClubApi/Program.cs` and clicking the play button in VS Code.

---

**You’re now fully set up to develop and test LitClub locally with the ASP.NET Core Web API and Cosmos DB Emulator!**

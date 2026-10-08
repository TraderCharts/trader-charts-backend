<div align="center">
    <img src="https://avatars.githubusercontent.com/u/235483245?u=f1859a88b3e3c9d1b5a5857079c364d3746a1ad9" width="200"/>
    <h1>
       Trader Charts
    </h1>
    <h3>
        Trader Charts is a tool for performing technical analysis with interactive charts. It allows users to visualize stock data or other asset data depending on what the data providers supply, and to apply technical indicators to analyze price trends 
    </h3>
   <h5>
      * One charting tool to rule them all *
   </h5>
</div>

---

![Node.js](https://img.shields.io/badge/Node-18.17.1-0078FF?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18.2-BD00FF?logo=express&logoColor=white)
![Babel](https://img.shields.io/badge/Babel-6.26.0-FF9A00?logo=babel&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-6.3.0-FF6F00?logo=mongodb&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6.35.2-E3FF00?logo=sequelize&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E=_9.5-5B8CD6?logo=postgresql&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-%3E=_5.5-5B8CD6?logo=mysql&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-%3E=_5.5-5B8CD6?logo=mariadb&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-%3E=_3-5B8CD6?logo=sqlite&logoColor=white)
![MSSQL](https://img.shields.io/badge/MSSQL-%3E=_2012-5B8CD6?logo=microsoft-sql-server&logoColor=white)
![Mocha](https://img.shields.io/badge/Mocha-3.5.3-A1D0FF?logo=mocha&logoColor=white)
![Dotenv](https://img.shields.io/badge/Dotenv-5.0.1-FFE699)
![CORS](https://img.shields.io/badge/CORS-2.8.4-FF9980)
![Luxon](https://img.shields.io/badge/Luxon-3.7.2-CAB8FF)
![Winston](https://img.shields.io/badge/Winston-3.18.3-F4C1C8)
![Morgan](https://img.shields.io/badge/Morgan-1.10.1-8EE0A9)
![ESLint](https://img.shields.io/badge/ESLint-9.37.0-B0E0D3)
![Prettier](https://img.shields.io/badge/Prettier-3.6.2-FFE0B3)
![License](https://img.shields.io/badge/License-MIT-C0C0C0)

> **Documentation updated through:** `v6.x`

---

## Trader Charts Backend - Overview

The **Backend** handles API requests, processes data, and serves chart information to the frontend.  
Built with Node.js, Express, Babel, MongoDB, and PostgreSQL via Sequelize, it acts as the bridge between the compute services and the frontend.  
[See frontend →](https://github.com/TraderCharts/trader-charts-frontend) | [See compute services →](https://github.com/TraderCharts/trader-charts-data-collector)

---

🚀 **Want to contribute?**

We welcome collaborators who wish to contribute and help enhance this trading tool. Feel free to reach out to the maintainers to get involved.

---

## Project Structure

> ⚠️ Important: Make sure you follow the existing project structure

- _/src_
    - _/adapters_: data access layer (DBs, APIs, external services)
    - _/controllers_: Express routes, organized by module
    - _/fixtures_: mock or fixture data
    - \_/managers: business logic layer — sits between controllers and adapters, handling data processing and coordination
- _/assets_: static public assets (images, CSS, client JS)
- _/config_: configuration files
- _/docs_: API and documentation files
- _/scripts_: helper or automation scripts
- _/scripts/install_: setup/installation scripts
- _/tests_: test files

### Installing project

Trader Charts Project is based on **Nodejs**, and use **Sequelize** to be able to connect to a **PostgreSQL** database.

It supports several database connections, SQL and mongodb, local and cloud databases.

1.  Install dependencies

        $ npm ci

## Features & Capabilities

### Core API

- Express-based REST API with modular routers, controllers, adapters, and business logic
- User management and authentication
- Negotiable instruments and instrument type management
- Indicators and alert condition management
- Alert condition expressions and operations
- API UI endpoints

### Market & Financial Data

- BYMA market data integration
- Configurable market data interval selection
- Bond financial metrics and calculations
- Financial instrument types and bond terms integration
- Daily market changes and bond market metrics

### Market Intelligence

- RSS feed aggregation
- News sentiment analysis and topic classification
- Trending news endpoints with AI-powered details

### Watchlists

- User-based watchlist management
- Ticker persistence
- Integration with market data

### API Documentation

- Swagger 2.0 API specification
- OpenAPI 3.0 API specification
- Redoc API documentation
- Automated API specification generation

### Logging & Code Quality

- SQL query logging
- Application logging
- HTTP request logging
- Code validation and linting
- Automated code formatting

### Deployment & Infrastructure

- Node.js 18, Express 4, and Babel 6 compatibility
- Docker support
- Docker Compose orchestration
- Kubernetes deployment support

## Database Connections

This project supports **SQL** and **MongoDB** databases.  
To use them, you must either install the database locally or use a cloud solution like **MongoDB Atlas** or **AWS**.  
After that, configure the required environment variables.

## Environments

There are three environments: **development**, **development with fixtures**, and **production**.

1. **Development with Mocked Database**  
   You just need to create an empty database. All tables and basic example data will be automatically installed at runtime.  
   To run the mocked database environment:

    ```
    npm run start-mock
    ```

2. **Development**  
   Database tables and structure will be created automatically. No fixture data will be inserted.  
   To run the development environment:

    ```
    npm run start-develop
    ```

3. **Production**  
   No data is set up automatically. You must create all tables and insert data manually.  
   To run the production environment:

    ```
    npm run start
    ```

## API

You can interact with the API using tools like **Postman**, or via **Trader Charts API**. We use **Swagger** for testing API endpoints and generating the API specification, and **Redoc** for a clean, readable API documentation.

### 1. Generate the API client

Before using the API, run the following command to generate the necessary Swagger API files:

```bash
npm run generate-swagger-api
```

### 2. Access the API

- **API Endpoints**
    - Access directly at [Trader Charts API](http://localhost:3002/api)

        ![Trader Charts API Screenshot](assets/private/readme/traderChartsAPI.png)

- **API Specifications**
    - View the [Swagger 2.0 spec](http://localhost:3002/api-spec)
    - View the [OpenAPI 3.0 spec](http://localhost:3002/api-spec/v3)

- **API Documentation**
    - Explore a clear API documentation at [Trader Charts Documentation](http://localhost:3002/docs/)

        ![Trader Charts API Documentation Screenshot](assets/private/readme/traderChartsRedoc.png)

### Testing the API

There are three main options for testing the project:

1. Access the Trader Charts API and make API calls directly using the **"Execute"** feature in the API Endpoints.
2. Run [Postman](https://www.postman.com/downloads) or any other similar tool for making calls.
3. Run [Frontend](https://github.com/TraderCharts/trader-charts-frontend) to test the integration with the project

### 2. Update the API Documentation

> **⚠️ Important:** When adding new endpoints, make sure to update the corresponding endpoint files and verify that all previous endpoints are still available in the documentation

#### Generate Runtime Documentation

1. Run the following command to generate documentation including all new endpoints:

```
npm run generate-swagger-api
```

2. Copy the runtime files **only after verifying your endpoints locally**. This is crucial to ensure the schemas appear correctly in Redoc.

3. After testing, replace the default specification files with the runtime versions by renaming them:

- Rename `swagger_runtime.json` to `swagger_default.json` (overwrites the default file)
- Rename `swagger_runtime_v3.json` to `swagger_default_v3.json` (overwrites the default file)

## Required Env Variables

### 🧩 Common Variables

These variables are shared across all environments.

> 📝 Note: You only need to include the variables for the database you are using (SQL **or** MongoDB).

#### SQL Database (only if using SQL)

        DB_HOST=[string]
        DB_NAME=[string]
        DB_PORT=[number]
        DB_USER=[string]
        DB_PASS=[string]
        DB_SSL=true

#### MongoDB (only if using MongoDB)

        DB_DIALECT=mongodb        # Use MongoDB instead of SQL ['mongodb', 'sql]
        ATLAS_URI=[string]      # MongoDB Atlas cloud URI
        MONGODB_URI=[string]    # Local/other MongoDB URI

### 🧪 Development

Create `.env.development.local` file:

        # + include all common variables

### 🚀 Production

Create `.env.production` file:

        NODE_PATH=./src
        NODE_ENV='production'
        # + include all common variables

## Contributors ✨

Thanks goes to these wonderful people:

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sgonzaloc"><img src="https://avatars.githubusercontent.com/u/6353386?v=4?s=100" width="100px;" alt="gonzalo"/><br /><sub><b>Gonzalo</b></sub></a></td>
    </tr>
  </tbody>
</table>

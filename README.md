# Aptos Sentinel AI Agent

A comprehensive blockchain monitoring and AI agent platform for the Aptos network, featuring real-time anomaly detection, predictive analytics, and secure confidential computing.

---

🚀 **Overview**

In the fast-evolving landscape of Web3, maintaining visibility and security on a dynamic blockchain like Aptos is paramount yet incredibly challenging. Users and developers alike face risks from unexpected network behaviors, volatile market shifts, and potential exploits. **Aptos Sentinel AI** emerges as a cutting-edge Web3 intelligence platform designed to address these challenges head-on.

It's an autonomous AI agent that tirelessly monitors the Aptos blockchain, providing **real-time insights, proactive anomaly detection, and secure, intelligent response capabilities.** Imagine having a dedicated, AI-powered guardian watching over the network, ready to alert you to irregularities and even execute pre-defined defensive actions. By seamlessly integrating the robust Aptos network with advanced AI from Gemini, predictive oracle capabilities from Allora, confidential computing via Marlin Protocol, and the analytical power of Google Cloud BigQuery, Aptos Sentinel AI delivers unparalleled peace of mind and enhanced control over your on-chain presence.

This platform transforms passive observation into active defense, enabling users to:
* **Stay Ahead of Risks:** Predict potential network stress and detect subtle anomalies before they become critical issues.
* **Automate Security:** Set up intelligent rules for autonomous responses to predefined threats, minimizing manual intervention.
* **Gain Deep Insights:** Understand complex blockchain data through intuitive dashboards and conversational AI.
* **Ensure Confidentiality:** Leverage trusted execution environments for sensitive analysis, keeping your security logic private and tamper-proof.

---

🏗️ **Architecture**

The platform integrates five major technology stacks, forming a robust and intelligent ecosystem:

* **Aptos Network** - The foundational Layer 1 blockchain, providing real-time transaction data and serving as the execution environment for autonomous agent actions.
* **Google Cloud BigQuery** - A powerful data warehouse for extensive historical blockchain analytics, enabling the AI to learn from past patterns.
* **Gemini AI** - Powers the intelligent analysis capabilities, providing conversational AI assistance and sophisticated rule generation from natural language input.
* **Allora Network** - A decentralized AI-powered oracle network providing predictive price forecasts and market intelligence crucial for proactive anomaly detection.
* **Marlin Protocol** - Utilizes Trusted Execution Environments (TEE) for secure, confidential computing, ensuring tamper-proof security analysis and sensitive decision-making.

---

🔧 **How It Works**

Aptos Sentinel AI operates as a sophisticated, multi-layered intelligence system, working seamlessly in the background to protect and inform.

**1. Real-Time Monitoring & Data Intelligence Pipeline:**
The journey begins with relentless data acquisition. Aptos Sentinel AI continuously pulls **live blockchain data** directly from the Aptos mainnet via official Node APIs, capturing every transaction, gas price fluctuation, and smart contract interaction. Simultaneously, it taps into the vast historical archives of **Google Cloud BigQuery**, processing immense datasets of past transaction patterns and network metrics. This dual stream of real-time and historical data feeds into the AI's core.

**2. Intelligent Analysis & Predictive Forecasting:**
Once data is ingested, the intelligence layers activate:
* **AI Processing (Gemini AI):** Gemini AI scrutinizes the incoming data streams, identifying complex patterns, detecting subtle irregularities, and interpreting blockchain events. This powerful AI engine also drives the conversational assistant, allowing users to query blockchain state and anomalies in natural language.
* **Predictive Analytics (Allora Network):** Allora Network's decentralized AI-powered oracle takes the real-time data to the next level by generating **predictive forecasts**. It anticipates future market movements (e.g., ETH/BTC price predictions) and, crucially for Aptos Sentinel AI, can be trained to predict potential network stress or unusual resource consumption based on current patterns. This foresight is key to proactive alerts.

**3. Secure Computation & Anomaly Detection:**
When potential anomalies or security-sensitive analyses are required, **Marlin Protocol's Trusted Execution Environment (TEE)** comes into play. Sensitive analysis logic (e.g., detailed security scoring, precise threat assessment) is executed within these tamper-proof, confidential VMs. This ensures that the AI's most critical decision-making processes remain private and verifiable, providing an uncompromised foundation for security recommendations. Detected anomalies, categorized by severity, are then presented to the user.

**4. Autonomous Actions & Wallet-Gated Control:**
The culmination of this pipeline is the ability for the AI agent to take action.
* **Rule-Based Execution:** The AI operates based on **predefined rules and responses** configured in the "Agent Governance" section (managed via ElizaOS). If a high-severity threat is confirmed (potentially after TEE analysis), the AI agent, deployed as a Move module on Aptos, can **automatically initiate on-chain actions.**
* **User Empowerment:** For critical actions like temporarily pausing a smart contract or blacklisting suspicious addresses, the platform prepares the transaction and routes it to the **user's connected OKX Wallet for secure confirmation and digital signature.** This "wallet-gated access control" ensures the user retains ultimate authority over their assets and maintains a non-custodial environment. For less critical alerts, the agent might simply log the event or trigger an off-chain notification.
* **Real-time Balance Monitoring:** The system continuously monitors the user's connected wallet balance, providing insights and even intelligent recommendations based on detected anomalies.

---

🌐 **Technology Integration**

* **Aptos Network**
    * Files: `client/src/hooks/useOKXWallet.ts`, `client/src/services/aptosBalance.ts`, `server/services/balanceMonitoring.ts`
    * **Live Wallet Integration:** Seamless connection with the OKX wallet via its `window.okxwallet` API for secure user authentication and transaction signing.
    * **Real-time Balance Monitoring:** Direct API calls to Aptos mainnet nodes enable constant tracking of the connected wallet's APT balance.
    * **Transaction Capabilities:** Facilitates secure signing and submission of transactions for autonomous actions.
    * **Network Metrics:** Provides live TPS, gas prices, and general transaction data for comprehensive monitoring.
    * *(Example: Real-time balance fetching: `const response = await fetch(`${aptosNodeUrl}/accounts/${address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`);`)*

* **Google Cloud BigQuery**
    * Files: `client/src/services/bigquery.ts`, `server/services/bigquery.ts`
    * **Historical Data Analysis:** Grants access to the `bigquery-public-data.crypto_aptos_mainnet_us` dataset, offering a rich historical record of Aptos blockchain activity.
    * **Network Metrics:** Used to query historical TPS, gas prices, transaction volumes, and other crucial network performance indicators.
    * **Pattern Recognition:** Enables long-term trend analysis and the identification of baseline patterns for anomaly detection.
    * **Data Warehousing:** Provides structured blockchain data for advanced analytics and machine learning model training.
    * *(Example: Network metrics query: `const metrics = await bigQueryService.getNetworkMetrics(); // Returns: { tps, avgGasPrice, pendingTransactions, activeContracts }`)*

* **Gemini AI**
    * Files: `client/src/services/gemini.ts`, `server/services/gemini.ts`, `client/src/hooks/useGeminiAPI.ts`
    * **Conversational AI:** Powers an intelligent chat assistant within the platform, allowing users to query blockchain insights and interact in natural language.
    * **Anomaly Analysis:** Provides AI-powered contextual analysis of detected network irregularities, offering more human-readable explanations.
    * **Rule Generation:** Facilitates smart contract rule suggestions based on natural language input, simplifying the creation of complex governance rules.
    * **Contextual Responses:** Delivers context-aware responses by integrating with the current network state and detected anomalies.
    * *(Example: AI-powered anomaly analysis: `const analysis = await geminiService.analyzeAnomaly(anomaly, currentMetrics);`)*

* **Allora Network (Predictive Oracle)**
    * Files: `client/src/services/allora.ts`, `client/src/components/AlloraPredictions.tsx`, `server/routes.ts`
    * **Decentralized AI Marketplace:** Integrates with Allora's testnet endpoints to fetch real-time price predictions for various assets (e.g., ETH, BTC).
    * **Multiple Timeframes:** Provides forecasts across different timeframes (e.g., 5-minute and 8-hour price predictions) crucial for predictive anomaly detection and strategic insights.
    * **Topic-based System:** Utilizes structured prediction topics with confidence intervals, allowing the AI agent to act on reliable forecasted signals.
    * *(Example: Multi-token predictions: `const predictions = await alloraService.getMultiTokenPredictions(); // Returns: { eth5m, eth8h, btc5m, btc8h }`)*
    * **Available Prediction Topics:**
        * Topic 13: ETH 5-minute price prediction
        * Topic 14: ETH 8-hour price prediction
        * Topic 17: BTC 5-minute price prediction
        * Topic 18: BTC 8-hour price prediction

* **Marlin Protocol (TEE)**
    * Files: `client/src/services/marlin.ts`, `client/src/components/MarlinTEE.tsx`, `server/routes.ts`
    * **Trusted Execution Environment:** Enables tamper-proof security analysis for critical operations, ensuring that the AI's decision-making logic remains confidential and cannot be manipulated.
    * **Confidential Computing:** Utilized for sensitive computations like secure wallet security scoring, where privacy and integrity are paramount.
    * **Attestation Verification:** Supports TEE-verified computation results, providing cryptographic proof that the analysis was performed correctly within a secure environment.
    * **Risk Assessment:** Facilitates privacy-preserving security recommendations and risk assessments.
    * *(Example: TEE security analysis: `const report = await marlinTEEService.executeBalanceSecurityCheck(walletAddress, balance); // Returns: { securityScore, risks, recommendations, teeProcessed, attestation }`)*

---

🛠️ **Features**

### Core Monitoring

* **Real-time Network Metrics:** Live display of Aptos network statistics including TPS, gas prices, and pending transactions.
* **Anomaly Detection:** AI-powered identification of network irregularities and deviations from normal behavior.
* **Historical Analysis:** Long-term trend analysis using extensive BigQuery data for deeper insights.
* **Wallet Balance Monitoring:** Real-time tracking of the connected OKX wallet's APT balance, with intelligent recommendations.

### AI-Powered Intelligence

* **Conversational Assistant:** A Gemini AI-powered chat assistant providing natural language blockchain insights and explanations.
* **Predictive Analytics:** Market and network forecasting using Allora's decentralized AI for proactive alerts.
* **Autonomous Agent:** Rule-based automated responses to predefined network events and security threats.
* **Security Analysis:** TEE-powered confidential security scoring and risk assessment.

### Advanced Security

* **Wallet Integration:** Secure and seamless connection with OKX Wallet for authentication and transaction signing.
* **TEE Computation:** Marlin Protocol-powered tamper-proof analysis for critical security decisions.
* **Access Control:** Wallet-based feature gating ensures only connected users can access advanced monitoring and control.
* **Autonomous Actions:** The AI agent can initiate on-chain actions with configurable governance rules, always requiring user confirmation for critical operations.

---



## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OKX Wallet browser extension
- API access to external services (optional for enhanced features)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd aptos-sentinel-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Configuration
The platform works out-of-the-box with embedded API keys for demonstration. For production use:

1. **Allora Network**: Replace the embedded API key in `client/src/services/allora.ts`
2. **Gemini AI**: Add your API key to environment variables
3. **BigQuery**: Configure Google Cloud credentials for enhanced data access

## 📊 Dashboard Overview

### Main Interface
- **Network Metrics Card**: Real-time Aptos network statistics
- **Wallet Balance Card**: Live APT balance with AI recommendations
- **Allora Predictions Card**: Multi-timeframe price forecasting
- **Marlin TEE Security Card**: Confidential security analysis
- **AI Assistant**: Conversational blockchain intelligence
- **Anomaly List**: Real-time network irregularity detection
- **Agent Governance**: Configurable autonomous response rules

### Real-time Data Flow
1. **WebSocket Connection**: Live updates from monitoring pipeline
2. **Automated Refresh**: 30-second intervals for all data sources
3. **Event-Driven Updates**: Instant notifications for anomalies and actions
4. **Persistent State**: Cross-session data retention and historical tracking

## 🔒 Security & Privacy

### Wallet Security
- **Non-custodial**: Private keys never leave your device
- **Secure Communication**: HTTPS/WSS for all data transmission
- **TEE Verification**: Marlin-powered tamper-proof computations
- **Access Control**: Wallet-based feature gating

### Data Privacy
- **Local Processing**: Sensitive computations in TEE environments
- **Minimal Data Collection**: Only necessary blockchain data
- **Transparent Operations**: Open-source verification
- **User Control**: Full control over data sharing and access

## 🌟 Advanced Features

### Autonomous AI Agent
- **Configurable Rules**: Custom response automation
- **Gas Price Monitoring**: Automatic alerts and actions
- **Security Scanning**: Proactive threat detection
- **Transaction Automation**: Predefined transaction execution

### Predictive Analytics
- **Multi-asset Forecasting**: ETH, BTC, and future APT predictions
- **Confidence Intervals**: Statistical prediction reliability
- **Historical Validation**: Backtesting and accuracy metrics
- **Market Intelligence**: Comprehensive crypto market insights

## 🙏 Acknowledgments

- **Aptos Foundation** - Blockchain infrastructure and APIs
- **Google Cloud** - BigQuery blockchain datasets
- **Allora Network** - Decentralized AI prediction infrastructure
- **Marlin Protocol** - Trusted Execution Environment services
- **OKX** - Wallet integration and Web3 infrastructure

---

**Built with ❤️ for the Aptos ecosystem**
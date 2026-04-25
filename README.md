# Apexify - Stock Market Simulator

A web-based stock market simulation platform built with Flask and vanilla JavaScript. Apexify allows users to practice trading stocks with virtual money in a realistic market environment featuring live price updates, interactive charts, and market news aggregation.

![Apexify](https://img.shields.io/badge/Apexify-Stock%20Simulator-a855f7?style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-f7df1e?style=for-the-badge&logo=javascript)

## Features

- **User Authentication**: Sign up and login functionality with session management via localStorage
- **Virtual Wallet**: Start with virtual cash, add or withdraw funds as needed
- **Real-time Stock Trading**: Buy and sell stocks from 10 major Indian companies with live price updates
- **Live Volatility Algorithm**: Simulated market movements with realistic price fluctuations every 2 seconds
- **Interactive Dashboard**:
  - Live portfolio tracking with P&L calculations
  - Trade history with timestamps
  - Visual stock performance charts using ApexCharts (candlestick charts)
  - Trending stocks widget
- **Multi-Source News Aggregator**: Live market news from Economic Times, Moneycontrol, and Times of India
- **Dark/Light Mode**: Toggle between themes with persistent preferences
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python Flask |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Database | JSON file (users.json) |
| Charts | ApexCharts |
| Icons | Font Awesome |

## Project Structure

```
stock_market/
├── app.py              # Flask backend server with news aggregation
├── users.json          # User data storage (balances, holdings, history)
├── static/
│   ├── styles.css      # Application styles (dark/light theme)
│   └── script.js       # Frontend JavaScript with volatility algorithm
├── templates/
│   ├── index.html      # Main dashboard with all views
│   ├── login.html      # Login page
│   └── signup.html     # Signup page
└── README.md
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AyushG04-sys/stockmarket.git
   cd stock_market
   ```

2. Install dependencies:
   ```bash
   pip install flask
   ```

3. Run the application:
   ```bash
   python app.py
   ```

4. Open your browser and navigate to `http://127.0.0.1:5000/`

## Usage

### Signing Up
1. Navigate to the signup page
2. Enter a unique username and password
3. Click "Sign Up" - account created with zero balance (add funds to start trading)

### Trading Stocks
1. **View Market**: Navigate to "Companies" tab to see live prices for 10 Indian stocks
2. **Buy Stocks**:
   - Enter quantity for any company
   - Click "Buy" (requires sufficient balance)
3. **Sell Stocks**:
   - Enter quantity to sell for stocks you own
   - Click "Sell"
4. **View Charts**: Click "Chart" button for candlestick visualization

### Managing Wallet
- **Add Funds**: Enter amount and click "+ Add" on the dashboard
- **Withdraw**: Enter amount and click "- Withdraw"

### Viewing Portfolio & P&L
- Navigate to "Profit & Loss" tab to see:
  - Net Worth (cash + holdings value)
  - Total Cash Deposited
  - Total P&L (profit/loss from trading)
  - Live Holdings with current market values

### Market News
- Navigate to "Market News" tab for live aggregated news from:
  - Economic Times
  - Moneycontrol
  - Times of India

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Login page |
| `/signup` | GET | Signup page |
| `/dashboard` | GET | Main trading dashboard |
| `/api/signup` | POST | Create new user |
| `/api/login` | POST | Authenticate user |
| `/api/user/<username>` | GET | Fetch user data |
| `/api/market` | GET | Get live market data |
| `/api/news` | GET | Fetch aggregated market news |
| `/api/wallet` | POST | Add/withdraw funds |
| `/api/buy` | POST | Buy stocks |
| `/api/sell` | POST | Sell stocks |

## Market Data

Available stocks:

| Company | Base Price (₹) |
|---------|----------------|
| TCS | 3,500 |
| RELIANCE | 2,500 |
| INFY | 1,400 |
| HDFC | 1,600 |
| WIPRO | 450 |
| ICICIBANK | 1,050 |
| SBIN | 750 |
| BHARTIARTL | 1,150 |
| ITC | 420 |
| LT | 3,600 |

## Key Features Explained

### Volatility Algorithm
- Stock prices update every 2 seconds with simulated market movements
- Each stock has a base price and current price that fluctuates based on random volatility
- Candlestick charts update in real-time showing Open, High, Low, Close (OHLC) data

### P&L Calculation
- **Net Worth** = Available Cash + Current Portfolio Value
- **Total P&L** = Net Worth - Net Deposits (deposits minus withdrawals)
- Holdings are valued at current market prices

### News Aggregation
- Fetches RSS feeds from multiple financial news sources
- Displays top 5 stories from each source
- Parses XML feeds server-side and returns JSON to frontend

## Screenshots

### Dashboard
The main trading interface with portfolio overview, cash balance, and stock charts.

### Features
- **Dark Mode**: Default theme with purple accents
- **Light Mode**: Alternative theme toggle
- **Trade History**: Complete log of all transactions (BUY, SELL, DEPOSIT, WITHDRAW)
- **Candlestick Charts**: Interactive OHLC price visualization via ApexCharts

## Future Enhancements

- [ ] Real-time stock price updates from external market API (NSE/BSE)
- [ ] Portfolio value tracking with intraday P&L graphs
- [ ] Advanced charting with technical indicators (RSI, MACD, Moving Averages)
- [ ] Leaderboard for top traders
- [ ] Export trade history to CSV/PDF
- [ ] Email notifications for price alerts
- [ ] Options/Futures trading simulation

## License

This project is open source and available for educational purposes.

## Contributors

- Ayush G04 ([@AyushG04-sys](https://github.com/AyushG04-sys))

---

Built with passion for the trading community. Happy Trading! 📈

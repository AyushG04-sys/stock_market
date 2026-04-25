# Apexify - Stock Market Simulator

A web-based stock market simulation platform built with Flask and vanilla JavaScript. Apexify allows users to practice trading stocks with virtual money in a realistic market environment.

![Apexify](https://img.shields.io/badge/Apexify-Stock%20Simulator-a855f7?style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-f7df1e?style=for-the-badge&logo=javascript)

## Features

- **User Authentication**: Sign up and login functionality with session management via localStorage
- **Virtual Wallet**: Start with ₹10,000 virtual cash, add or withdraw funds
- **Real-time Stock Trading**: Buy and sell stocks from 10 major Indian companies
- **Interactive Dashboard**:
  - Live portfolio tracking
  - Trade history with timestamps
  - Visual stock performance charts using Chart.js
- **Dark/Light Mode**: Toggle between themes with persistent preferences
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python Flask |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Database | JSON file (users.json) |
| Charts | Chart.js |
| Icons | Font Awesome |

## Project Structure

```
hackathon/
├── app.py              # Flask backend server
├── stockmarket.py      # Console-based stock market (legacy)
├── users.json          # User data storage
├── static/
│   ├── styles.css      # Application styles
│   └── script.js       # Frontend JavaScript
├── templates/
│   ├── index.html      # Dashboard page
│   ├── login.html      # Login page
│   └── signup.html     # Signup page
└── README.md
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AyushG04-sys/stockmarket.git
   cd hackathon
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
3. Click "Sign Up" - you'll receive ₹10,000 virtual cash

### Trading Stocks
1. **View Market**: Dashboard shows live prices for 10 Indian stocks:
   - TCS, RELIANCE, INFY, HDFC, WIPRO, ICICIBANK, SBIN, BHARTIARTL, ITC, LT

2. **Buy Stocks**:
   - Select a company from the dropdown
   - Enter quantity
   - Click Buy (requires sufficient balance)

3. **Sell Stocks**:
   - Select a company you own
   - Enter quantity to sell
   - Click Sell

4. **Manage Wallet**:
   - Add funds: Enter amount and click "+ Add"
   - Withdraw: Enter amount and click "- Withdraw"

### Viewing History
- All transactions (BUY, SELL, DEPOSIT, WITHDRAW) are logged with timestamps
- Accessible from the Trade History tab

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
| `/api/wallet` | POST | Add/withdraw funds |
| `/api/buy` | POST | Buy stocks |
| `/api/sell` | POST | Sell stocks |

## Market Data

Initial stock prices and availability:

| Company | Price (₹) | Available Stocks |
|---------|-----------|------------------|
| TCS | 3,500 | 1,000 |
| RELIANCE | 2,500 | 1,500 |
| INFY | 1,400 | 2,000 |
| HDFC | 1,600 | 800 |
| WIPRO | 450 | 3,000 |
| ICICIBANK | 1,050 | 1,200 |
| SBIN | 750 | 2,500 |
| BHARTIARTL | 1,150 | 900 |
| ITC | 420 | 4,000 |
| LT | 3,600 | 500 |

## Screenshots

### Dashboard
The main trading interface with portfolio overview, cash balance, and stock charts.

### Features
- **Dark Mode**: Default theme with purple accents
- **Light Mode**: Alternative theme toggle
- **Trade History**: Complete log of all transactions
- **Stock Charts**: Interactive price visualization

## Future Enhancements

- [ ] Real-time stock price updates via external API
- [ ] Portfolio value tracking with profit/loss calculation
- [ ] Advanced charting with technical indicators
- [ ] Multi-user support with proper authentication
- [ ] Leaderboard for top traders
- [ ] Export trade history to CSV/PDF

## License

This project is open source and available for educational purposes.

## Contributors

- Ayush G04 ([@AyushG04-sys](https://github.com/AyushG04-sys))

---

Built with passion for the hackathon community. Happy Trading! 📈

import json
import os
import urllib.request
import xml.etree.ElementTree as ET
from flask import Flask, render_template, jsonify, request
from datetime import datetime

app = Flask(__name__)
DB_FILE = 'users.json'

def load_data():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, 'w') as f:
            json.dump({}, f)
        return {}
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

market = {
    "TCS": {"price": 3500.0, "available_stocks": 1000},
    "RELIANCE": {"price": 2500.0, "available_stocks": 1500},
    "INFY": {"price": 1400.0, "available_stocks": 2000},
    "HDFC": {"price": 1600.0, "available_stocks": 800},
    "WIPRO": {"price": 450.0, "available_stocks": 3000},
    "ICICIBANK": {"price": 1050.0, "available_stocks": 1200},
    "SBIN": {"price": 750.0, "available_stocks": 2500},
    "BHARTIARTL": {"price": 1150.0, "available_stocks": 900},
    "ITC": {"price": 420.0, "available_stocks": 4000},
    "LT": {"price": 3600.0, "available_stocks": 500}
}

@app.route('/')
def login_page(): return render_template('login.html')

@app.route('/signup')
def signup_page(): return render_template('signup.html')

@app.route('/dashboard')
def dashboard(): return render_template('index.html')

@app.route('/api/market', methods=['GET'])
def get_market(): return jsonify(market), 200

@app.route('/api/signup', methods=['POST'])
def signup():
    username = request.json.get('username')
    users = load_data()
    if username in users: return jsonify({"error": "User exists!"}), 400
    users[username] = {"cash_balance": 0.0, "portfolio_value": 0.0, "holdings": {}, "history": []}
    save_data(users)
    return jsonify({"message": "User created"}), 201

@app.route('/api/login', methods=['POST'])
def login_api():
    username = request.json.get('username')
    users = load_data()
    if username in users: return jsonify({"message": "Success"}), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/api/user/<username>', methods=['GET'])
def get_user_data(username):
    users = load_data()
    user = users.get(username)
    if user: return jsonify(user), 200
    return jsonify({"error": "Not found"}), 404

@app.route('/api/wallet', methods=['POST'])
def wallet_action():
    data = request.json
    username = data.get('username')
    action = data.get('action')
    try: amount = float(data.get('amount', 0))
    except ValueError: return jsonify({"error": "Invalid amount"}), 400
    
    users = load_data()
    user = users.get(username)
    if not user: return jsonify({"error": "User not found"}), 404
    
    date_str = datetime.now().strftime("%b %d, %H:%M")
    if action == 'add':
        user['cash_balance'] += amount
        user['history'].insert(0, {"name": "WALLET", "type": "DEPOSIT", "amount": amount, "date": date_str, "status": "success"})
    elif action == 'withdraw':
        if amount > user['cash_balance']: return jsonify({"error": "Insufficient funds"}), 400
        user['cash_balance'] -= amount
        user['history'].insert(0, {"name": "WALLET", "type": "WITHDRAW", "amount": amount, "date": date_str, "status": "success"})
    
    save_data(users)
    return jsonify({"message": "Success"}), 200

@app.route('/api/buy', methods=['POST'])
def buy_stock():
    data = request.json
    username = data.get('username')
    company = data.get('company').upper()
    qty = int(data.get('qty', 0))
    
    users = load_data()
    user = users.get(username)
    stock = market.get(company)
    
    # Grab the live price sent from the frontend Javascript!
    live_price = float(data.get('price', stock['price']))
    
    cost = live_price * qty
    if cost > user['cash_balance']: return jsonify({"error": "Low balance"}), 400
    
    user['cash_balance'] -= cost
    stock['available_stocks'] -= qty
    user['holdings'][company] = user['holdings'].get(company, 0) + qty
    user['history'].insert(0, {"name": company, "type": "BUY", "amount": cost, "date": datetime.now().strftime("%b %d, %H:%M"), "status": "success"})
    
    save_data(users)
    return jsonify({"message": f"Bought {qty} {company}!"}), 200

@app.route('/api/sell', methods=['POST'])
def sell_stock():
    data = request.json
    username = data.get('username')
    company = data.get('company').upper()
    qty = int(data.get('qty', 0))
    
    users = load_data()
    user = users.get(username)
    stock = market.get(company)
    
    # Grab the live price sent from the frontend Javascript!
    live_price = float(data.get('price', stock['price']))
    
    owned = user['holdings'].get(company, 0)
    if qty > owned: return jsonify({"error": f"You only own {owned} shares of {company}!"}), 400
    
    revenue = live_price * qty
    user['cash_balance'] += revenue
    stock['available_stocks'] += qty
    user['holdings'][company] -= qty
    
    if user['holdings'][company] == 0:
        del user['holdings'][company] 
        
    user['history'].insert(0, {"name": company, "type": "SELL", "amount": revenue, "date": datetime.now().strftime("%b %d, %H:%M"), "status": "success"})
    
    save_data(users)
    return jsonify({"message": f"Sold {qty} {company}!"}), 200

# --- LIVE NEWS ROUTE ---
@app.route('/api/news', methods=['GET'])
def get_news():
    feeds = [
        {'url': 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', 'name': 'Economic Times'},
        {'url': 'https://www.moneycontrol.com/rss/latestnews.xml', 'name': 'Moneycontrol'},
        {'url': 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms', 'name': 'Times of India'}
    ]
    news_items = []
    
    for feed in feeds:
        try:
            req = urllib.request.Request(feed['url'], headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                xml_data = response.read()

            root = ET.fromstring(xml_data)
            count = 0
            for item in root.findall('./channel/item'):
                title = item.find('title').text if item.find('title') is not None else 'No Title'
                pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ''
                link = item.find('link').text if item.find('link') is not None else '#'
                
                description = item.find('description').text if item.find('description') is not None else ''
                short_desc = description[:150] + '...' if len(description) > 150 else description
                
                news_items.append({
                    'title': title,
                    'time': pub_date.replace('GMT', '').replace('+0530', '').strip(), 
                    'source': feed['name'],
                    'link': link,
                    'body': short_desc
                })
                
                count += 1
                if count >= 5: break
        except Exception as e:
            print(f"Error fetching from {feed['name']}:", e)
            
    if news_items:
        return jsonify(news_items)
    else:
        return jsonify([{'title': 'Live Feed Unavailable', 'time': 'Just now', 'source': 'System', 'body': 'Check internet connection.', 'link': '#'}])

if __name__ == '__main__':
    app.run(debug=True)
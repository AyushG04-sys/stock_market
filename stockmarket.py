def main():
    # Hash Map to store market data (O(1) lookups for trading)
    market = {
        "TCS": {"price": 3500.0, "available_stocks": 100},
        "RELIANCE": {"price": 2500.0, "available_stocks": 150},
        "INFY": {"price": 1400.0, "available_stocks": 200},
        "HDFC": {"price": 1600.0, "available_stocks": 80}
    }

    # 1. Take the name of the user
    print("\n" + "="*40)
    print("🚀 WELCOME TO THE STOCK SIMULATOR 🚀")
    print("="*40)
    user_name = input("Enter your name: ")

    # 2. The user should input the amount they have
    while True:
        try:
            balance = float(input(f"Hello, {user_name}! Enter your starting balance: ₹"))
            if balance < 0:
                print("Balance cannot be negative.")
                continue
            break
        except ValueError:
            print("❌ Invalid input. Please enter a valid number.")

    # Dictionary to track the user's purchased stocks
    portfolio = {}

    while True:
        # 3. Display the list of companies, prices, and available stocks
        print("\n" + "-"*40)
        print("📊 LIVE MARKET DATA")
        print("-"*40)
        print(f"{'COMPANY':<12} | {'PRICE':<10} | {'AVAILABLE STOCKS'}")
        print("-"*40)
        for company, data in market.items():
            print(f"{company:<12} | ₹{data['price']:<9} | {data['available_stocks']}")
        
        print("\n" + "-"*40)
        print(f"💼 {user_name}'s Balance: ₹{balance:,.2f}")
        if portfolio:
            print(f"📦 Your Holdings: {portfolio}")
        print("-"*40)

        print("\nWhat would you like to do?")
        print("1. Buy Stocks")
        print("2. Sell Stocks")
        print("3. Exit")
        
        choice = input("Enter choice (1/2/3): ")

        if choice == '1':
            company = input("Enter the company name to BUY: ").upper()
            if company not in market:
                print("❌ Company not found in the market.")
                continue
                
            try:
                # 4. Take the number of stocks he wants to buy
                qty = int(input(f"How many stocks of {company} do you want to buy? "))
                if qty <= 0:
                    print("❌ Quantity must be greater than 0.")
                    continue
                
                total_cost = market[company]["price"] * qty
                
                # Check if user has enough money and market has enough stocks
                if total_cost > balance:
                    print(f"❌ Insufficient funds! You need ₹{total_cost:,.2f} but only have ₹{balance:,.2f}.")
                elif qty > market[company]["available_stocks"]:
                    print(f"❌ Not enough stocks available in the market. Only {market[company]['available_stocks']} left.")
                else:
                    # 5. Do the calculation and tell final amount
                    balance -= total_cost
                    market[company]["available_stocks"] -= qty
                    portfolio[company] = portfolio.get(company, 0) + qty
                    print(f"✅ SUCCESS! You paid ₹{total_cost:,.2f} for {qty} stocks of {company}.")
                    
            except ValueError:
                print("❌ Please enter a valid whole number for quantity.")

        elif choice == '2':
            company = input("Enter the company name to SELL: ").upper()
            owned_qty = portfolio.get(company, 0)
            
            if owned_qty == 0:
                print(f"❌ You don't own any stocks of {company}.")
                continue
                
            try:
                # 4. Take the number of stocks he wants to sell
                qty = int(input(f"How many stocks of {company} do you want to sell? (You own {owned_qty}): "))
                if qty <= 0 or qty > owned_qty:
                    print(f"❌ Invalid quantity. You can sell between 1 and {owned_qty} stocks.")
                    continue
                
                # 5. Do the calculation and tell final amount
                total_revenue = market[company]["price"] * qty
                balance += total_revenue
                market[company]["available_stocks"] += qty
                portfolio[company] -= qty
                
                # Clean up portfolio if stocks reach 0
                if portfolio[company] == 0:
                    del portfolio[company]
                    
                print(f"✅ SUCCESS! You received ₹{total_revenue:,.2f} for selling {qty} stocks of {company}.")
                
            except ValueError:
                print("❌ Please enter a valid whole number for quantity.")

        elif choice == '3':
            print(f"\nExiting program... Thanks for playing, {user_name}!")
            print(f"Final Balance: ₹{balance:,.2f}")
            break
            
        else:
            print("❌ Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()
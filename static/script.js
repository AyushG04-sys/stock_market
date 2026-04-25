document.addEventListener('DOMContentLoaded', function() {
    // Basic redirect guard for standard login flow
    const currentUser = localStorage.getItem('currentUser');
    if(!currentUser) {
        window.location.href = '/'; 
        return;
    }

    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) greetingEl.innerText = 'Hi, ' + currentUser;

    window.currentUserData = null; 

    // --- TAB SWITCHING LOGIC ---
    const menuItems = document.querySelectorAll('#sidebar-menu li');
    const views = ['view-dashboard', 'view-companies', 'view-pnl', 'view-news', 'view-newbie', 'view-userinfo'];

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const targetView = this.getAttribute('data-view');
            views.forEach(viewId => document.getElementById(viewId).classList.add('hidden'));
            document.getElementById(targetView).classList.remove('hidden');

            fetchUserData();
            if (targetView === 'view-companies') fetchMarketData();
            if (targetView === 'view-pnl') updatePnLDashboard();
            if (targetView === 'view-news') renderNews(); 
        });
    });

    // --- MARKET NEWS ENGINE ---
    window.renderNews = function() {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;

        newsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Fetching live market news from aggregators...</p>';

        fetch('/api/news')
            .then(res => res.json())
            .then(newsData => {
                newsContainer.innerHTML = ''; 
                newsData.forEach(news => {
                    newsContainer.innerHTML += `
                        <div class="card info-card" style="margin-bottom: 0;">
                            <h3 style="color: #3b82f6; margin-bottom: 8px;">
                                <a href="${news.link}" target="_blank" style="color: inherit; text-decoration: none;">${news.title}</a>
                            </h3>
                            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                                <i class="far fa-clock"></i> ${news.time} &nbsp;|&nbsp; <i class="fas fa-globe"></i> <strong>${news.source}</strong>
                            </p>
                            <p style="line-height: 1.6; color: var(--text-color);">${news.body.replace(/(<([^>]+)>)/gi, "")}</p>
                            <a href="${news.link}" target="_blank" style="display: inline-block; margin-top: 10px; color: #4ade80; font-weight: bold; text-decoration: none; font-size: 0.9rem;">
                                Read Full Article <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    `;
                });
            })
            .catch(err => {
                newsContainer.innerHTML = '<p style="color: #f87171; text-align: center;">Failed to load live news feed.</p>';
            });
    }

    // --- FETCH USER DATA ---
    window.fetchUserData = function() {
        fetch(`/api/user/${currentUser}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) return;
                
                window.currentUserData = data; 

                const balanceFormatted = '₹' + data.cash_balance.toLocaleString('en-IN', {minimumFractionDigits: 2});
                document.getElementById('balance-display').innerText = balanceFormatted;
                document.getElementById('info-balance').innerText = balanceFormatted;
                
                let totalStocks = 0;
                const holdingsBody = document.getElementById('holdings-body');
                holdingsBody.innerHTML = '';

                for (const [company, qty] of Object.entries(data.holdings)) {
                    totalStocks += qty;
                    holdingsBody.innerHTML += `<tr><td><strong>${company}</strong></td><td>${qty}</td></tr>`;
                }
                document.getElementById('info-total-stocks').innerText = totalStocks;
                if(totalStocks === 0) holdingsBody.innerHTML = `<tr><td colspan="2" style="text-align:center;">No stocks owned yet.</td></tr>`;

                const tableBody = document.getElementById('transaction-body');
                if (tableBody) {
                    tableBody.innerHTML = ''; 
                    data.history.forEach(tx => {
                        const typeColor = (tx.type === 'BUY' || tx.type === 'DEPOSIT') ? '#4ade80' : '#f87171';
                        tableBody.innerHTML += `
                            <tr>
                                <td><strong>${tx.name}</strong></td>
                                <td><strong style="color: ${typeColor}">${tx.type}</strong></td>
                                <td>₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td>${tx.date}</td>
                                <td><span class="status-badge ${tx.status}">${tx.status}</span></td>
                            </tr>
                        `;
                    });
                }
                updatePnLDashboard(); 
            });
    }

    // --- PROFIT & LOSS CALCULATOR ---
    window.updatePnLDashboard = function() {
        if (!window.currentUserData || !window.marketState) return;

        let netDeposits = 0;
        window.currentUserData.history.forEach(tx => {
            if (tx.name === "WALLET" && tx.type === "DEPOSIT") netDeposits += tx.amount;
            if (tx.name === "WALLET" && tx.type === "WITHDRAW") netDeposits -= tx.amount;
        });

        let portfolioValue = 0;
        const pnlBody = document.getElementById('pnl-holdings-body');
        if (pnlBody) pnlBody.innerHTML = '';

        for (const [company, qty] of Object.entries(window.currentUserData.holdings)) {
            if (qty <= 0) continue; 
            
            let livePrice = window.marketState[company] ? window.marketState[company].currentPrice : 0;
            let currentValue = livePrice * qty;
            portfolioValue += currentValue;

            if (pnlBody) {
                pnlBody.innerHTML += `
                    <tr>
                        <td><strong>${company}</strong></td>
                        <td>${qty}</td>
                        <td>₹${livePrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="font-weight: bold;">₹${currentValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    </tr>
                `;
            }
        }

        if (pnlBody && portfolioValue === 0) {
            pnlBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-secondary);">No active holdings. Buy stocks to see them here!</td></tr>`;
        }

        let netWorth = window.currentUserData.cash_balance + portfolioValue;
        let totalPnL = netWorth - netDeposits;

        const networthEl = document.getElementById('pnl-networth');
        const investedEl = document.getElementById('pnl-invested');
        const pnlEl = document.getElementById('pnl-total');

        if(networthEl) networthEl.innerText = '₹' + netWorth.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        if(investedEl) investedEl.innerText = '₹' + netDeposits.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        if (pnlEl) {
            if (totalPnL > 0) {
                pnlEl.innerHTML = `<span style="color: #4ade80;">+₹${totalPnL.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>`;
            } else if (totalPnL < 0) {
                pnlEl.innerHTML = `<span style="color: #f87171;">-₹${Math.abs(totalPnL).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>`;
            } else {
                pnlEl.innerText = '₹0.00';
                pnlEl.style.color = 'var(--text-secondary)';
            }
        }
    }

    // --- TRENDING STOCKS UI ---
    window.updateTrendingStocksUI = function() {
        const trendingList = document.getElementById('trending-list-body');
        if (!trendingList || !window.marketState || Object.keys(window.marketState).length === 0) return;

        const targetCompanies = ['TCS', 'RELIANCE', 'INFY', 'HDFC'];
        const companySubtitles = {'TCS': 'IT Services', 'RELIANCE': 'Conglomerate', 'INFY': 'IT Services', 'HDFC': 'Banking'};

        let htmlStr = '';
        targetCompanies.forEach(company => {
            if (window.marketState[company]) {
                let currentPrice = window.marketState[company].currentPrice;
                let basePrice = window.marketState[company].basePrice;
                let percentChange = ((currentPrice - basePrice) / basePrice) * 100;
                
                let sign = percentChange >= 0 ? '+' : '';
                let colorCode = percentChange >= 0 ? '#4ade80' : '#f87171'; 

                htmlStr += `
                    <li>
                        <div class="stock-info"><strong>${company}</strong><span>${companySubtitles[company]}</span></div>
                        <div class="stock-price-info text-right">
                            <strong>₹${currentPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                            <br><span class="change" style="color: ${colorCode}; font-weight: bold; font-size: 0.9rem;">${sign}${percentChange.toFixed(2)}%</span>
                        </div>
                    </li>
                `;
            }
        });
        trendingList.innerHTML = htmlStr;
    }

    // --- VOLATILITY ALGO & APEXCHARTS ---
    let candleChart;       
    let dashboardChart;    
    let globalTicker;
    let activeChartCompany = null;
    window.marketState = {}; 

    function initGlobalMarket(data) {
        let currentTime = new Date().getTime();
        for (const [company, info] of Object.entries(data)) {
            let basePrice = info.price;
            let history = [];
            let tempTime = currentTime - (40 * 60 * 1000); 
            let tempPrice = basePrice;

            for(let i=0; i<40; i++) {
                let vol = basePrice * 0.005; 
                let open = tempPrice;
                let high = open + (Math.random() * vol);
                let low = open - (Math.random() * vol);
                let close = low + (Math.random() * (high - low));
                history.push({ x: tempTime, y: [open.toFixed(2), high.toFixed(2), low.toFixed(2), close.toFixed(2)] });
                tempPrice = close;
                tempTime += (60 * 1000); 
            }
            window.marketState[company] = { basePrice: basePrice, currentPrice: tempPrice, history: history, lastTime: tempTime, tickCount: 0 };
        }
        startGlobalTicker();
        updateTrendingStocksUI(); 
    }

    function startGlobalTicker() {
        if(globalTicker) clearInterval(globalTicker);
        globalTicker = setInterval(() => {
            for (let company in window.marketState) {
                let state = window.marketState[company];
                let vol = state.basePrice * 0.001; 
                let change = (Math.random() - 0.5) * vol;
                state.currentPrice += change;

                let lastCandle = state.history[state.history.length - 1];
                let open = parseFloat(lastCandle.y[0]);
                let high = Math.max(parseFloat(lastCandle.y[1]), state.currentPrice);
                let low = Math.min(parseFloat(lastCandle.y[2]), state.currentPrice);
                let close = state.currentPrice;

                lastCandle.y = [open.toFixed(2), high.toFixed(2), low.toFixed(2), close.toFixed(2)];
                state.tickCount++;

                if (state.tickCount >= 30) {
                    state.lastTime += (60 * 1000); 
                    state.history.push({ x: state.lastTime, y: [close.toFixed(2), close.toFixed(2), close.toFixed(2), close.toFixed(2)] });
                    if(state.history.length > 40) state.history.shift(); 
                    state.tickCount = 0; 
                }

                let priceCell = document.getElementById(`price-${company}`);
                let change24Cell = document.getElementById(`change-24-${company}`);
                let changeCandleCell = document.getElementById(`change-candle-${company}`);

                if(priceCell && change24Cell && changeCandleCell) {
                    let percent24 = ((state.currentPrice - state.basePrice) / state.basePrice) * 100;
                    let color24 = percent24 >= 0 ? '#4ade80' : '#f87171';
                    let sign24 = percent24 >= 0 ? '+' : '';
                    change24Cell.innerHTML = `<span style="color: ${color24}; font-weight: bold;">${sign24}${percent24.toFixed(2)}%</span>`;

                    let percentCandle = ((state.currentPrice - open) / open) * 100;
                    let colorCandle = percentCandle >= 0 ? '#4ade80' : '#f87171';
                    let signCandle = percentCandle >= 0 ? '+' : '';
                    let iconCandle = percentCandle >= 0 ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>';
                    
                    changeCandleCell.innerHTML = `<span style="color: ${colorCandle}; font-weight: bold;">${signCandle}${percentCandle.toFixed(3)}% ${iconCandle}</span>`;
                    priceCell.innerText = "₹" + state.currentPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                }

                if(company === activeChartCompany && candleChart) candleChart.updateSeries([{ data: state.history }]);

                const selector = document.getElementById('company-selector');
                if (selector && company === selector.value && dashboardChart) dashboardChart.updateSeries([{ data: state.history }]);
            }
            
            if (!document.getElementById('view-pnl').classList.contains('hidden')) updatePnLDashboard(); 
            if (!document.getElementById('view-dashboard').classList.contains('hidden')) updateTrendingStocksUI();

        }, 2000); 
    }

    window.renderCandleChart = function(companyName) {
        activeChartCompany = companyName;
        const titleEl = document.getElementById('candlestick-title');
        if (titleEl) titleEl.innerText = `${companyName} - LIVE MARKET FEED`;

        const isLightMode = document.body.classList.contains('light-mode');
        const options = {
            series: [{ data: window.marketState[companyName].history }],
            chart: { type: 'candlestick', height: 350, background: 'transparent', toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: false } },
            theme: { mode: isLightMode ? 'light' : 'dark' },
            plotOptions: { candlestick: { colors: { upward: '#26a69a', downward: '#ef5350' }, wick: { useDataPoints: true } } },
            grid: { borderColor: isLightMode ? '#e4e4e7' : '#3f3f46', strokeDashArray: 4 },
            xaxis: { type: 'datetime', labels: { datetimeUTC: false, format: 'HH:mm' } },
            yaxis: { tooltip: { enabled: true }, labels: { formatter: function(value) { return "₹" + value.toFixed(2); } } }
        };

        if (candleChart) candleChart.destroy();
        candleChart = new ApexCharts(document.querySelector("#candlestick-chart"), options);
        candleChart.render();
    }

    window.renderDashboardChart = function(companyName) {
        const isLightMode = document.body.classList.contains('light-mode');
        const options = {
            series: [{ data: window.marketState[companyName].history }],
            chart: { type: 'candlestick', height: 300, background: 'transparent', toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: false } },
            theme: { mode: isLightMode ? 'light' : 'dark' },
            plotOptions: { candlestick: { colors: { upward: '#26a69a', downward: '#ef5350' }, wick: { useDataPoints: true } } },
            grid: { borderColor: isLightMode ? '#e4e4e7' : '#3f3f46', strokeDashArray: 4 },
            xaxis: { type: 'datetime', labels: { datetimeUTC: false, format: 'HH:mm' } },
            yaxis: { tooltip: { enabled: true }, labels: { formatter: function(value) { return "₹" + value.toFixed(2); } } }
        };

        if (dashboardChart) dashboardChart.destroy();
        dashboardChart = new ApexCharts(document.querySelector("#dashboard-chart"), options);
        dashboardChart.render();
    }

    const companySelector = document.getElementById('company-selector');
    if (companySelector) {
        companySelector.addEventListener('change', function(e) {
            if (window.marketState[e.target.value]) renderDashboardChart(e.target.value);
        });
    }

    window.fetchMarketData = function() {
        fetch('/api/market')
            .then(res => res.json())
            .then(data => {
                if (companySelector && companySelector.options.length === 0) {
                    Object.keys(data).forEach(company => {
                        companySelector.innerHTML += `<option value="${company}">${company}</option>`;
                    });
                }

                if(Object.keys(window.marketState).length === 0) initGlobalMarket(data);

                const marketBody = document.getElementById('market-body');
                if (marketBody) marketBody.innerHTML = '';
                
                for (const [company, info] of Object.entries(data)) {
                    let price = window.marketState[company] ? window.marketState[company].currentPrice : info.price;
                    if (marketBody) {
                        marketBody.innerHTML += `
                            <tr>
                                <td><strong>${company}</strong></td>
                                <td id="price-${company}" style="font-weight: bold;">₹${price.toFixed(2)}</td>
                                <td id="change-24-${company}">0.00%</td>
                                <td id="change-candle-${company}">0.000%</td>
                                <td>${info.available_stocks}</td>
                                <td style="display: flex; gap: 5px; align-items: center;">
                                    <button onclick="renderCandleChart('${company}')" style="background: #3b82f6; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 5px; font-weight: bold;"><i class="fas fa-chart-bar"></i> Chart</button>
                                    <input type="number" id="qty-${company}" class="trade-input" min="1" placeholder="Qty">
                                    <button onclick="executeTrade('${company}', 'buy')" class="buy-btn-sm">Buy</button>
                                    <button onclick="executeTrade('${company}', 'sell')" class="sell-btn-sm">Sell</button>
                                </td>
                            </tr>
                        `;
                    }
                }
                const firstCompany = Object.keys(data)[0];
                renderCandleChart(firstCompany);
                if (companySelector) renderDashboardChart(companySelector.value);
            });
    }

    // --- TRADE & WALLET LOGIC ---
    window.executeTrade = function(company, action) {
        const qtyInput = document.getElementById(`qty-${company}`);
        const qty = parseInt(qtyInput ? qtyInput.value : 0);

        if (!qty || qty <= 0) return alert("Please enter a valid quantity.");

        const livePrice = window.marketState[company] ? window.marketState[company].currentPrice : 0;

        fetch(action === 'buy' ? '/api/buy' : '/api/sell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, company: company, qty: qty, price: livePrice })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert("❌ " + data.error);
            else {
                alert("✅ " + data.message);
                if (qtyInput) qtyInput.value = ''; 
                fetchUserData();     
            }
        });
    }

    function handleWallet(action) {
        const amountInput = document.getElementById('wallet-amount');
        const amount = parseFloat(amountInput.value);
        if(!amount || amount <= 0) return alert("Enter valid amount");

        fetch('/api/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, action: action, amount: amount })
        })
        .then(res => res.json())
        .then(data => {
            if(data.error) alert(data.error);
            else { amountInput.value = ''; fetchUserData(); }
        });
    }

    const addBtn = document.getElementById('add-funds-btn');
    const withdrawBtn = document.getElementById('withdraw-funds-btn');
    if(addBtn) addBtn.addEventListener('click', () => handleWallet('add'));
    if(withdrawBtn) withdrawBtn.addEventListener('click', () => handleWallet('withdraw'));

    // --- THEME TOGGLE LOGIC ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        if (localStorage.getItem('theme') === 'light-mode') {
            document.body.classList.add('light-mode');
            themeToggle.checked = true;
        }
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('light-mode');
                localStorage.setItem('theme', 'light-mode');
            } else {
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark-mode');
            }
            if (activeChartCompany) renderCandleChart(activeChartCompany);
            if (companySelector) renderDashboardChart(companySelector.value);
        });
    }

    // Init Page Data
    fetchUserData();
    fetchMarketData(); 
});
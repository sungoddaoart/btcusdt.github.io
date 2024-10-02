document.addEventListener("DOMContentLoaded", function() {
    const defaultToken = 'BTCUSDT'; // 默认代币
    const defaultProfitTarget = 200; // 默认盈利目标
    const defaultInvestment = 20000; // 默认总投资（20000 USDT）

    let currentPrice = 0; // 当前实时价格

    // Fetch price from Binance API
    const fetchPrice = async(token) => {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${token}`);
            if (!response.ok) {
                console.error(`Failed to fetch price for ${token}: ${response.statusText}`);
                throw new Error(`无法获取 ${token} 的价格`);
            }
            const data = await response.json();
            return parseFloat(data.price);
        } catch (error) {
            console.error(`Error fetching price for ${token}:`, error);
            throw new Error(`无法获取 ${token} 的价格，请检查代币代码或稍后再试。`);
        }
    };

    // Update the displayed token price and refresh strategy
    const updateTokenPriceDisplay = async() => {
        const token = document.getElementById("token").value.toUpperCase() || defaultToken;
        try {
            currentPrice = await fetchPrice(token);
            const precision = token === 'SHIBUSDT' ? 8 : 2; // Adjust precision for SHIB or other tokens
            document.getElementById("tokenPrice").textContent = `${token}: ${currentPrice.toFixed(precision)} USDT`;
            updateStrategy(); // Update strategy after price fetch
        } catch (error) {
            document.getElementById("tokenPrice").textContent = error.message;
        }
    };

    // Update the strategy tables based on the current price and user input
    const updateStrategy = () => {
        const profitTarget = parseFloat(document.getElementById("profitTarget").value) || defaultProfitTarget;
        const investment = parseFloat(document.getElementById("investment").value) || defaultInvestment;

        // Calculate the number of tokens bought
        const tokenAmount = investment / currentPrice;

        const times = 10; // Execute 10 times strategy

        const descTableBody = document.getElementById("desc-strategy").querySelector("tbody");
        const ascTableBody = document.getElementById("asc-strategy").querySelector("tbody");

        // Clear previous table entries
        descTableBody.innerHTML = '';
        ascTableBody.innerHTML = '';

        // Descending channel strategy
        for (let i = 1; i <= times; i++) {
            const buyPriceDesc = currentPrice * (1 - (i * 0.002)); // Each buy price 0.2% lower than current
            const sellPriceDesc = buyPriceDesc * 1.02; // Sell 2% higher than buy

            const sellAmountDesc = tokenAmount * sellPriceDesc;
            const buyAmountDesc = tokenAmount * buyPriceDesc;
            const profitDesc = sellAmountDesc - buyAmountDesc;

            // Append row to descending strategy table
            const descRow = `
                <tr>
                    <td>${i}</td>
                    <td>${buyPriceDesc.toFixed(8)}</td> <!-- Display buy price -->
                    <td>${sellPriceDesc.toFixed(8)}</td> <!-- Display sell price -->
                    <td>${tokenAmount.toFixed(8)}</td> <!-- Display token amount -->
                    <td>${sellAmountDesc.toFixed(2)}</td> <!-- Display sell amount -->
                    <td>${profitDesc.toFixed(2)}</td> <!-- Display profit -->
                </tr>
            `;
            descTableBody.insertAdjacentHTML('beforeend', descRow);
        }

        // Ascending channel strategy
        for (let i = 1; i <= times; i++) {
            const buyPriceAsc = currentPrice * (1 + (i * 0.002)); // Each buy price 0.2% higher than current
            const sellPriceAsc = buyPriceAsc * 1.02; // Sell 2% higher than buy

            const sellAmountAsc = tokenAmount * sellPriceAsc;
            const buyAmountAsc = tokenAmount * buyPriceAsc;
            const profitAsc = sellAmountAsc - buyAmountAsc;

            // Append row to ascending strategy table
            const ascRow = `
                <tr>
                    <td>${i}</td>
                    <td>${buyPriceAsc.toFixed(8)}</td> <!-- Display buy price -->
                    <td>${sellPriceAsc.toFixed(8)}</td> <!-- Display sell price -->
                    <td>${tokenAmount.toFixed(8)}</td> <!-- Display token amount -->
                    <td>${sellAmountAsc.toFixed(2)}</td> <!-- Display sell amount -->
                    <td>${profitAsc.toFixed(2)}</td> <!-- Display profit -->
                </tr>
            `;
            ascTableBody.insertAdjacentHTML('beforeend', ascRow);
        }
    };

    // Button click event to update token price and strategy
    document.getElementById("queryBtn").addEventListener("click", updateTokenPriceDisplay);

    // Initialize the page with the default token price and strategy
    updateTokenPriceDisplay();
});
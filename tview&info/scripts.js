"use strict";

// Blockchain info data
const blockchainInfo = {
    BTCUSD: {
        name: "Bitcoin (BTC)",
        description: "The first decentralized cryptocurrency, enabling peer-to-peer transactions without a central authority.",
        consensus: "Proof of Work (PoW)",
        smartContractLang: "N/A (Bitcoin does not have smart contracts)",
        learningResources: "Learn more about Bitcoin at <a href='https://www.bitcoin.org/en/how-it-works' target='_blank'>Bitcoin.org</a>",
        explorer: "https://www.blockchain.com/explorer"
    },
    ETHUSD: {
        name: "Ethereum (ETH)",
        description: "A decentralized platform that enables smart contracts and decentralized applications (dApps) to be built and run without downtime.",
        consensus: "Proof of Stake (PoS)",
        smartContractLang: "Solidity",
        learningResources: "Learn Solidity at <a href='https://docs.soliditylang.org/en/v0.8.19/' target='_blank'>Solidity Documentation</a>",
        explorer: "https://etherscan.io"
    },
    MATICUSD: {
        name: "Polygon (MATIC)",
        description: "A protocol and framework for building and connecting Ethereum-compatible blockchain networks.",
        consensus: "Proof of Stake (PoS)",
        smartContractLang: "Solidity",
        learningResources: "Learn Solidity at <a href='https://docs.soliditylang.org/en/v0.8.19/' target='_blank'>Solidity Documentation</a>",
        explorer: "https://polygonscan.com"
    },
    ARBUSD: {
        name: "Arbitrum (ARB)",
        description: "A Layer 2 scaling solution for Ethereum, designed to increase transaction throughput and reduce fees.",
        consensus: "Proof of Stake (PoS)",
        smartContractLang: "Solidity",
        learningResources: "Learn Solidity at <a href='https://docs.soliditylang.org/en/v0.8.19/' target='_blank'>Solidity Documentation</a>",
        explorer: "https://arbiscan.io"
    },
    OPUSD: {
        name: "Optimism (OP)",
        description: "A Layer 2 scaling solution for Ethereum, utilizing Optimistic Rollups to achieve high throughput.",
        consensus: "Proof of Stake (PoS)",
        smartContractLang: "Solidity",
        learningResources: "Learn Solidity at <a href='https://docs.soliditylang.org/en/v0.8.19/' target='_blank'>Solidity Documentation</a>",
        explorer: "https://optimistic.etherscan.io"
    },
    SKLUSD: {
        name: "Skale (SKL)",
        description: "A decentralized network that provides scalable and high-performance blockchain solutions.",
        consensus: "Proof of Stake (PoS)",
        smartContractLang: "Solidity",
        learningResources: "Learn Solidity at <a href='https://docs.soliditylang.org/en/v0.8.19/' target='_blank'>Solidity Documentation</a>",
        explorer: "https://explorer.skale.network"
    }
};

// Function to create and load the TradingView widget
function createTradingViewWidget(symbol) {
    const widgetOptions = {
        container_id: 'tradingview-widget',
        symbol: symbol,
        interval: 'D', // Daily interval
        width: '100%',
        height: '500px',
        autosize: true,
        backgroundColor: '#ffffff',
        hide_top_toolbar: false,
        hide_side_toolbar: true,
        hide_legend: false,
        show_volume: true,
        locale: 'en'
    };

    function createWidget(options) {
        const widgetContainer = document.getElementById(options.container_id);
        const iframe = document.createElement("iframe");
        iframe.title = "TradingView Widget";
        iframe.lang = options.locale || "en";
        iframe.style.cssText = `width: ${options.width}; height: ${options.height}; margin: 0 !important; padding: 0 !important;`;
        iframe.setAttribute("frameBorder", "0");
        iframe.setAttribute("allowTransparency", "true");
        iframe.setAttribute("scrolling", "no");

        const url = new URL("https://www.tradingview.com/widgetembed/");
        const params = {
            symbol: options.symbol,
            interval: options.interval,
            autosize: options.autosize ? "1" : "0",
            backgroundColor: options.backgroundColor,
            hide_top_toolbar: options.hide_top_toolbar ? "1" : "0",
            hide_side_toolbar: options.hide_side_toolbar ? "1" : "0",
            hide_legend: options.hide_legend ? "1" : "0",
            show_volume: options.show_volume ? "1" : "0"
        };
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        iframe.src = url.href;
        widgetContainer.innerHTML = ''; // Clear previous widget
        widgetContainer.appendChild(iframe);
    }

    createWidget(widgetOptions);
    updateBlockchainInfo(symbol);
}

// Function to update blockchain info
function updateBlockchainInfo(symbol) {
    const info = blockchainInfo[symbol];
    if (info) {
        const blockchainInfoSection = document.getElementById('blockchain-info');
        blockchainInfoSection.innerHTML = `
            <h2>${info.name}</h2>
            <p>${info.description}</p>
            <p><strong>Consensus Mechanism:</strong> ${info.consensus}</p>
            <p><strong>Smart Contract Language:</strong> ${info.smartContractLang}</p>
            <p><strong>Learning Resources:</strong> ${info.learningResources}</p>
            <p><strong>Explorer:</strong> <a href="${info.explorer}" target="_blank">${info.explorer}</a></p>
        `;
    } else {
        console.error('Blockchain info not found for symbol:', symbol);
    }
}

// Function to load the TradingView widget
function loadWidget(symbol) {
    createTradingViewWidget(symbol);
}

// Risk/Reward Ratio Calculator
function calculateRiskReward() {
    const entryPrice = parseFloat(document.getElementById('entry-price').value);
    const targetPrice = parseFloat(document.getElementById('target-price').value);
    const stopLoss = parseFloat(document.getElementById('stop-loss').value);

    if (isNaN(entryPrice) || isNaN(targetPrice) || isNaN(stopLoss) || entryPrice <= 0 || targetPrice <= 0 || stopLoss <= 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    const risk = entryPrice - stopLoss;
    const reward = targetPrice - entryPrice;
    const ratio = (reward / risk).toFixed(2);

    document.getElementById('risk-reward-ratio').innerText = `Risk/Reward Ratio: ${ratio}`;
    
    // Draw the chart
    drawRiskRewardChart(risk, reward);
}

function drawRiskRewardChart(risk, reward) {
    const ctx = document.getElementById('risk-reward-chart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Risk', 'Reward'],
            datasets: [{
                label: 'Amount',
                data: [risk, reward],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Capture The Flag (CTF) challenges section
function updateCTFInfo() {
    const ctfInfoSection = document.getElementById('ctf-info');
    ctfInfoSection.innerHTML = `
        <h2>Capture The Flag (CTF) Challenges</h2>
        <p>Capture The Flag (CTF) challenges are a popular way to develop and test cybersecurity skills, including those related to crypto, blockchain, and data science. These challenges involve solving security-related puzzles or exploiting vulnerabilities to capture a "flag," which is a piece of information or a token that indicates success.</p>
        <p>CTFs can be categorized into various types:</p>
        <ul>
            <li><strong>Crypto:</strong> Challenges focused on cryptographic techniques and vulnerabilities.</li>
            <li><strong>Blockchain:</strong> Challenges related to blockchain security and smart contracts.</li>
            <li><strong>Data Science:</strong> Challenges involving data analysis, machine learning, and data manipulation.</li>
            <li><strong>Hacking:</strong> General hacking challenges that may cover a range of security issues and techniques.</li>
        </ul>
        <p>Participating in CTFs is an excellent way to sharpen your skills and stay updated on the latest security trends and techniques. Here are some resources to get started:</p>
        <ul>
            <li><a href="https://ctftime.org/" target="_blank">CTFtime: CTF Events and Rankings</a></li>
            <li><a href="https://www.hackthebox.com/" target="_blank">Hack The Box: Penetration Testing Labs and Challenges</a></li>
            <li><a href="https://www.tryhackme.com/" target="_blank">TryHackMe: Interactive Cybersecurity Training</a></li>
        </ul>
    `;
}

// Initialize the page with the default widget and info
window.onload = function() {
    loadWidget('BTCUSD');
    updateCTFInfo();
};

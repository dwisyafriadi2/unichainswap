const { ethers } = require('ethers');
const readline = require('readline');

// Sepolia WETH contract address (for wrapping ETH)
const WETH_SEPOLIA_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';

// Unichain bridge contract address on Sepolia
const UNICHAIN_BRIDGE_ADDRESS = '0xea58fcA6849d79EAd1f26608855c2D6407d54Ce2';

// Unichain bridge contract ABI (minimal ABI for bridgeETHTo function)
const bridgeAbi = [
  "function bridgeETHTo(address _to, uint32 _minGasLimit, bytes _extraData) payable"
];

// Create a command line interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get the current gas price from the network
const getCurrentGasPrice = async (provider) => {
    try {
        const gasPrice = await provider.getGasPrice();
        console.log('Current gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'Gwei');
        return gasPrice;
    } catch (error) {
        console.error('Error fetching gas price:', error);
        throw error;
    }
};

// Function to bridge ETH to Unichain
const bridgeEthToUnichain = async (privateKey, rpcUrl, recipient, amountInEth, extraData) => {
    // Setup provider to connect to the provided RPC URL
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Create a wallet instance
    const wallet = new ethers.Wallet(privateKey, provider);

    // Create a contract instance for the Unichain bridge contract
    const bridgeContract = new ethers.Contract(UNICHAIN_BRIDGE_ADDRESS, bridgeAbi, wallet);

    console.log(`Bridging ${amountInEth} ETH to ${recipient} on Unichain`);

    // Convert the input amount to Wei (smallest unit of ETH)
    const amountInWei = ethers.utils.parseEther(amountInEth);

    try {
        // Get the current gas price
        const gasPrice = await getCurrentGasPrice(provider);

        // Estimate the gas limit for the transaction
        const estimatedGasLimit = await bridgeContract.estimateGas.bridgeETHTo(
            recipient,
            200000, // Example minimal gas limit for the destination chain
            extraData,
            {
                value: amountInWei
            }
        );

        console.log('Estimated gas limit:', estimatedGasLimit.toString());

        // Send the bridge transaction to transfer ETH to Unichain
        const tx = await bridgeContract.bridgeETHTo(
            recipient,
            200000, // Example minimal gas limit for the destination chain
            extraData,
            {
                value: amountInWei, // Amount of ETH to bridge
                gasLimit: estimatedGasLimit, // Use the estimated gas limit
                gasPrice: gasPrice // Use the current gas price
            }
        );

        console.log('Bridge transaction hash:', tx.hash);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Bridge transaction confirmed in block:', receipt.blockNumber);

    } catch (error) {
        console.error('Error during the bridge transaction:', error);
    }
};

// Prompt the user for input
rl.question('Enter your private key: ', (privateKey) => {
    rl.question('Enter the RPC URL: ', (rpcUrl) => {
        rl.question('Enter the recipient address for the bridge: ', (recipient) => {
            rl.question('Enter the amount of ETH to bridge (e.g., 0.001): ', (amountInEth) => {
                rl.question('Enter extra data (as a hex string, or leave empty): ', (extraData) => {
                    // Convert the extraData to a format usable by the contract call
                    const extraDataBytes = ethers.utils.toUtf8Bytes(extraData || '');

                    console.log(`\nBridging ${amountInEth} ETH to ${recipient}`);

                    // Start the bridging process
                    bridgeEthToUnichain(privateKey, rpcUrl, recipient, amountInEth, extraDataBytes)
                        .then(() => {
                            console.log('Bridge transaction completed.');
                            rl.close();
                        })
                        .catch(error => {
                            console.error('Error during the bridge process:', error);
                            rl.close();
                        });
                });
            });
        });
    });
});

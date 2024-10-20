const { ethers } = require('ethers');
const readline = require('readline');

// The WETH contract address for Sepolia
const WETH_SEPOLIA_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';

// WETH contract ABI (minimal ABI for deposit function)
const wethAbi = [
  "function deposit() payable"
];

// Create a command line interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to wrap ETH into WETH
const wrapEthToWeth = async (privateKey, rpcUrl, amountInEth, repetition) => {
    // Setup provider to connect to the provided RPC URL
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Create a wallet instance
    const wallet = new ethers.Wallet(privateKey, provider);

    // Create a contract instance for the WETH contract
    const wethContract = new ethers.Contract(WETH_SEPOLIA_ADDRESS, wethAbi, wallet);

    for (let i = 0; i < repetition; i++) {
        console.log(`Transaction ${i + 1} out of ${repetition}: Wrapping ${amountInEth} ETH into WETH`);

        // Convert the input amount to Wei (smallest unit of ETH)
        const amountInWei = ethers.utils.parseEther(amountInEth);

        try {
            // Send the deposit transaction to wrap ETH into WETH
            const tx = await wethContract.deposit({
                value: amountInWei, // Amount of ETH to wrap
                gasLimit: 49000, // Set an appropriate gas limit
                gasPrice: ethers.utils.parseUnits('5', 'gwei') // Example gas price
            });

            console.log('Transaction hash:', tx.hash);

            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            console.log('Transaction confirmed in block:', receipt.blockNumber);

        } catch (error) {
            console.error(`Error during transaction ${i + 1}:`, error);
            break; // Stop the loop if any transaction fails
        }
    }
};

// Prompt the user for input
rl.question('Enter your private key: ', (privateKey) => {
    rl.question('Enter the RPC URL: ', (rpcUrl) => {
        rl.question('Enter the number of repetitions: ', (repetitionInput) => {
            const repetition = parseInt(repetitionInput);

            rl.question('Enter the amount of ETH to wrap (e.g., 0.00004): ', (amountInEth) => {
                console.log(`\nTotal Transactions: ${repetition}`);
                console.log(`Amount to wrap per transaction: ${amountInEth} ETH\n`);

                // Start the wrapping process
                wrapEthToWeth(privateKey, rpcUrl, amountInEth, repetition).then(() => {
                    console.log('All transactions completed.');
                    rl.close();
                }).catch(error => {
                    console.error('Error during transactions:', error);
                    rl.close();
                });
            });
        });
    });
});

// Enhanced CDMA Signal Visualizer
const canvas = document.getElementById('signalCanvas');
const ctx = canvas.getContext('2d');
const simulateButton = document.getElementById('simulateButton');
const downloadButton = document.getElementById('downloadButton');
const userSignalInput = document.getElementById('userSignal');
const spreadingCodeInput = document.getElementById('spreadingCode');
const snrDisplay = document.getElementById('snr');
const berDisplay = document.getElementById('ber');

// Helper Functions
function parseInput(input) {
    return input.split(',').map(Number);
}

function calculateSNR(signal, noise) {
    const signalPower = signal.reduce((sum, x) => sum + x * x, 0) / signal.length;
    const noisePower = noise.reduce((sum, x) => sum + x * x, 0) / noise.length;
    return 10 * Math.log10(signalPower / noisePower);
}

function calculateBER(original, received) {
    let errors = 0;
    for (let i = 0; i < original.length; i++) {
        if (original[i] !== received[i]) errors++;
    }
    return errors / original.length;
}

function drawSignal(signal, color, yOffset) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    let x = 0;
    const step = canvas.width / signal.length;
    ctx.moveTo(x, canvas.height / 2 + yOffset * 50);
    signal.forEach((value) => {
        x += step;
        ctx.lineTo(x, canvas.height / 2 + yOffset * 50 - value * 40);
    });
    ctx.stroke();
}

function simulateCDMA() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get user inputs
    const userSignal = parseInput(userSignalInput.value || "1,-1,1,1,-1,1,-1,-1");
    const spreadingCode = parseInput(spreadingCodeInput.value || "1,-1,1,-1,1,-1,1,-1");

    // Spread and Transmit Signal
    const transmittedSignal = userSignal.map((bit, i) => bit * spreadingCode[i]);

    // Simulate Noise
    const noise = Array(transmittedSignal.length).fill(0).map(() => (Math.random() - 0.5) * 0.5);

    // Received Signal
    const receivedSignal = transmittedSignal.map((val, i) => val + noise[i]);

    // Detect Signal
    const detectedSignal = receivedSignal.map((val, i) => (val * spreadingCode[i] > 0 ? 1 : -1));

    // Calculate Metrics
    const snr = calculateSNR(transmittedSignal, noise).toFixed(2);
    const ber = calculateBER(userSignal, detectedSignal).toFixed(2);

    // Update Metrics Display
    snrDisplay.textContent = `SNR: ${snr} dB`;
    berDisplay.textContent = `BER: ${ber}`;

    // Draw Signals
    drawSignal(userSignal, 'blue', -1);
    drawSignal(transmittedSignal, 'green', 0);
    drawSignal(receivedSignal, 'red', 1);
}

function downloadVisualization() {
    const link = document.createElement('a');
    link.download = 'cdma_visualization.png';
    link.href = canvas.toDataURL();
    link.click();
}

simulateButton.addEventListener('click', simulateCDMA);
downloadButton.addEventListener('click', downloadVisualization);

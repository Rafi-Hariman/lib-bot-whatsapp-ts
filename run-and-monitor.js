const { spawn } = require('child_process');

function startExampleScript() {
    const process = spawn('npm', ['run', 'example']);

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
        // Ketika proses mati, tunggu beberapa detik lalu jalankan kembali
        console.log(`Process exited with code ${code}. Restarting...`);
        setTimeout(startExampleScript, 5000);
    });
}

startExampleScript();

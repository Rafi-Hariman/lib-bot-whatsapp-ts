import express from 'express';
import { BaileysClass } from '../lib/baileys.js';
import path from 'path';

const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

const botBaileys = new BaileysClass({});
let userStep = 'initial_response';

botBaileys.on('auth_failure', async (error) => console.log("ERROR BOT: ", error));
botBaileys.on('qr', (qr) => console.log("NEW QR CODE: ", qr));
botBaileys.on('ready', async () => console.log('READY BOT'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

botBaileys.on('message', async (message) => {
    const command = message.body.toLowerCase().trim();

    switch (userStep) {
        case 'initial_response':
            await botBaileys.sendText(message.from, `Selamat datang di MenoPal. MenoPal adalah chatbot interaktif yang dapat membantu Anda dalam mengetahui dan menentukan gangguan pada menstruasi.`);

            // Kirimkan polling untuk konfirmasi minat menggunakan bot
            await botBaileys.sendPoll(message.from, 'Apakah Anda tertarik untuk menggunakan bot ini?', {
                options: ['Iya', 'Tidak'],
                multiselect: false
            });
            userStep = 'handle_poll_response';
            break;

        case 'handle_poll_response':
            if (command === 'iya') {
                await botBaileys.sendText(
                    message.from,
                    `Baik, sebelum menggunakan fitur MenoPal ini, silahkan isi link berikut https://forms.gle/dLKUdo3gvzdCFqnL9.`
                );

                setTimeout(async () => {
                    await botBaileys.sendPoll(message.from, 'Apakah Anda sudah mengisi Form:', {
                        options: ['Sudah', 'Belum'],
                        multiselect: false
                    });
                    userStep = 'form_confirmation';
                }, 15 * 1000);

            } else if (command === 'tidak') {
                await botBaileys.sendText(
                    message.from,
                    'Terima kasih sudah menggunakan MenoPal. Semoga menstruasi anda tetap kondusif.'
                );
                userStep = 'end';
            } else {
                await botBaileys.sendText(message.from, 'Mohon pilih salah satu opsi: "Iya" atau "Tidak".');
            }
            break;

        case 'form_confirmation':
            if (command === 'sudah') {
                await botBaileys.sendText(message.from, `Terima kasih sudah mengisi form. Untuk mengetahui gangguan menstruasi, pilih kategori di bawah ini.`);
                await botBaileys.sendPoll(message.from, 'Pilih Kategori:', {
                    options: ['Siklus', 'Volume', 'Lama', 'Gangguan Lain'],
                    multiselect: false
                });
                userStep = 'category_selection';
            } else if (command === 'belum') {
                await botBaileys.sendText(message.from, 'Silakan isi form terlebih dahulu sebelum melanjutkan.');
                userStep = 'end';
            } else {
                await botBaileys.sendText(message.from, 'Mohon pilih salah satu opsi: "Sudah" atau "Belum".');
            }
            break;

        case 'category_selection':
            switch (command) {
                case 'siklus':
                    await botBaileys.sendPoll(message.from, 'Pilih salah satu kondisi:', {
                        options: ['Siklus haid kurang dari 21 hari', 'Siklus menstruasi lebih dari 35 hari', 'Tidak menstruasi selama 3 bulan'],
                        multiselect: false
                    });
                    userStep = 'siklus_category';
                    break;

                case 'volume':
                    await botBaileys.sendPoll(message.from, 'Pilih salah satu kondisi:', {
                        options: ['Perdarahan banyak (lebih dari 8 hari)', 'Perdarahan sedikit (siklus menstruasi lebih dari 35 hari)'],
                        multiselect: false
                    });
                    userStep = 'volume_category';
                    break;

                case 'lama':
                    await botBaileys.sendPoll(message.from, 'Pilih salah satu kondisi:', {
                        options: ['Lama menstruasi lebih dari 8 hari', 'Lama menstruasi kurang dari 3 hari'],
                        multiselect: false
                    });
                    userStep = 'lama_category';
                    break;

                case 'gangguan lain':
                    await botBaileys.sendPoll(message.from, 'Pilih salah satu kondisi:', {
                        options: ['Kram perut bagian bawah, nyeri punggung, mual muntah, diare', 'Malas bergerak, nyeri payudara, muncul jerawat, nafsu makan meningkat'],
                        multiselect: false
                    });
                    userStep = 'other_category';
                    break;
            }
            break;

        // Siklus Category
        case 'siklus_category':
            if (command === 'siklus haid kurang dari 21 hari') {
                await botBaileys.sendText(message.from, 'Gangguan menstruasi berupa Polimenorhea. Polimenorhea merupakan gangguan menstruasi yang ditandai dengan siklus haid yang kurang dari 21 hari dan perdarahan yang lebih sedikit. Diperlukan konsulasi ke dokter jika Anda mengalami tanda-tanda di atas.');
                await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
                userStep = 'handle_inquiry_poll';
            } else if (command === 'siklus menstruasi lebih dari 35 hari') {
                await botBaileys.sendText(message.from, 'Gangguan menstruasi berupa Oligomenorhea. Oligomenorrhea adalah menstruasi yang jarang atau sangat sedikit, atau lebih tepatnya periode menstruasi yang berlangsung lebih dari 35 hari. Berbagai kondisi dapat menjadi penyebabnya. Diperlukan konsulasi ke dokter jika Anda mengalami tanda-tanda di atas.');
                await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
                userStep = 'handle_inquiry_poll';
            } else if (command === 'tidak menstruasi selama 3 bulan') {
                await botBaileys.sendPoll(message.from, 'Apakah Anda pernah menstruasi sebelumnya?', {
                    options: ['Pernah', 'Tidak pernah'],
                    multiselect: false
                });
                userStep = 'amenorrhea_check';
            }
            break;

        // Volume Category
        case 'volume_category':
            if (command === 'perdarahan banyak (lebih dari 8 hari)') {
                await botBaileys.sendText(message.from, 'Gangguan menstruasi berupa Hipermonorea. Hipermenorea adalah kondisi medis yang ditandai dengan perdarahan haid yang lebih banyak atau lebih lama dari normal. Diperlukan konsulasi ke dokter jika Anda mengalami tanda-tanda di atas.');
                await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
                userStep = 'handle_inquiry_poll';
            } else if (command === 'perdarahan sedikit (siklus menstruasi lebih dari 35 hari)') {
                await botBaileys.sendText(message.from, 'Gangguan menstruasi berupa Oligomenorhea. Oligomenorrhea adalah menstruasi yang jarang atau sangat sedikit, atau lebih tepatnya periode menstruasi yang berlangsung lebih dari 35 hari. Berbagai kondisi dapat menjadi penyebabnya. Diperlukan konsulasi ke dokter jika Anda mengalami tanda-tanda di atas.');
                await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
                userStep = 'handle_inquiry_poll';
            }
            break;

        // Lama Category
        case 'lama_category':
            if (command === 'lama menstruasi lebih dari 8 hari') {
                await botBaileys.sendText(message.from, 'Gangguan menstruasi berupa Hipermonorea. Hipermenorea adalah kondisi medis yang ditandai dengan perdarahan haid yang lebih banyak atau lebih lama dari normal. Diperlukan konsulasi ke dokter jika Anda mengalami tanda-tanda di atas.');
                await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
                userStep = 'handle_inquiry_poll';
            } else if (command === 'lama menstruasi kurang dari 3 hari') {
                await botBaileys.sendText(message.from, 'Gangguan menstruasi berupa Hipomenorea. Hipomenorea adalah perdarahan haid yang lebih sedikit dari biasanya, yaitu terjadinya perdarahan menstruasi yang lebih sedikit dari volume normal dan lamanya kurang dari 3 hari. Diperlukan konsulasi ke dokter jika Anda mengalami tanda-tanda di atas.');
                await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
                userStep = 'handle_inquiry_poll';
            }
            break;

        // Gangguan Lain Category
        case 'other_category':
            if (command === 'kram perut bagian bawah, nyeri punggung, mual muntah, diare') {
                await botBaileys.sendText(message.from,
                    '“Gangguan menstruasi berupa Dismenorea.\n\n' +
                    'Dismenorea merupakan salah satu masalah yang dihadapi wanita saat menstruasi, berupa sakit perut, kram, dan nyeri punggung adalah beberapa gejala yang dapat mempersulit aktivitas sehari-hari. Nyeri yang tajam dan sporadis serta kram di perut bagian bawah adalah gejala umum dismenorea, dan biasanya berpindah ke punggung, paha, selangkangan, dan vulva. Biasanya dimulai sehari sebelum atau tepat sebelum aliran menstruasi dimulai, nyeri ini biasanya memuncak dalam sehari. Dan beberapa gejala lain seperti:\n' +
                    '1. Sering buang air kecil (darah dalam urin)\n' +
                    '2. Mual\n' +
                    '3. Muntah\n' +
                    '4. Diare\n' +
                    '5. Migrain\n' +
                    '6. Menggigil\n' +
                    '7. Kembung\n' +
                    '8. Nyeri payudara\n' +
                    '9. Sedih\n' +
                    '10. Mudah tersinggung\n\n' +
                    'Upaya penanganan dismenorea:\n' +
                    '1. Kompres hangat\n' +
                    '2. Senam dismenorea\n' +
                    '3. Pengalihan rasa sakit\n' +
                    '4. Masase\n' +
                    '5. Relaksasi aromaterapi\n' +
                    '6. Pola makan sehat\n' +
                    '7. Obat pereda nyeri\n\n' +
                    'Ada yang ingin ditanyakan?”'
                );
                await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
                userStep = 'handle_inquiry_poll';
            } else if (command === 'malas bergerak, nyeri payudara, muncul jerawat, nafsu makan meningkat') {
                await botBaileys.sendText(message.from,
                    '“Gangguan menstruasi berupa Premenstrual Syndrome (PMS).\n\n' +
                    'Premenstrual Syndrome (PMS) adalah kelainan di mana tubuh menunjukkan sejumlah gejala yang berhubungan dengan siklus menstruasi. Gejala sering kali mulai terlihat 7-10 hari sebelum dimulainya siklus menstruasi dan hilang begitu siklus menstruasi dimulai. Gejala Premenstrual Syndrome adalah:\n' +
                    '1. Fisik:\n' +
                    '   - Nyeri payudara\n' +
                    '   - Penambahan berat badan\n' +
                    '   - Sakit kepala\n' +
                    '   - Edema\n' +
                    '   - Kram perut\n' +
                    '   - Kembung\n' +
                    '   - Jerawat\n' +
                    '   - Nyeri otot\n' +
                    '   - Diare\n' +
                    '   - Sembelit\n\n' +
                    '2. Psikologis:\n' +
                    '   - Kelupaan\n' +
                    '   - Kelelahan\n' +
                    '   - Kesulitan fokus\n' +
                    '   - Nafsu makan meningkat\n\n' +
                    '3. Perilaku:\n' +
                    '   - Mudah tersinggung\n' +
                    '   - Menangis tersedu-sedu\n' +
                    '   - Cemas\n' +
                    '   - Susah tidur\n' +
                    '   - Gairah seks meningkat\n' +
                    '   - Depresi\n\n' +
                    'Upaya penanganan:\n' +
                    'PMS sulit dihindari karena tidak ada yang tahu apa penyebabnya. Mempertahankan gaya hidup sehat adalah pendekatan paling efektif untuk menurunkan peluang Anda terkena PMS.\n\n' +
                    'Ada yang ingin ditanyakan?”'
                );
                await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
                userStep = 'handle_inquiry_poll';
            }
            break;

        // Amenorrhea Check
        case 'amenorrhea_check':
            if (command === 'pernah') {
                await botBaileys.sendText(message.from, 'Gangguan menstruasi berupa Amenenorhea sekunder. Amemenorrhea sekunder adalah kondisi ketika seorang wanita yang sudah pernah mengalami menstruasi tidak menstruasi selama lebih dari tiga bulan berturut-turut. Diperlukan konsulasi ke dokter jika Anda mengalami tanda-tanda di atas.');
            } else {
                await botBaileys.sendText(message.from, 'Gangguan menstruasi berupa Amemenorhea primer. Amenorea primer adalah kondisi ketika seorang wanita belum mengalami menstruasi pertamanya pada usia 15 tahun atau 3 tahun setelah menarche. Diperlukan konsulasi ke dokter jika Anda mengalami tanda-tanda di atas.');
            }
            await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                options: ['Iya', 'Tidak'],
                multiselect: false
            });
            userStep = 'handle_inquiry_poll';
            break;

        // Sending Poll for Inquiry


        // Handling Inquiry Poll
        case 'handle_inquiry_poll':
            if (command === 'iya') {
                await botBaileys.sendText(
                    message.from,
                    `Baik, MenoPal akan menyambungkan ke customer service. Mohon tunggu.`
                );
                setTimeout(async () => {
                    await botBaileys.sendText(
                        message.from,
                        `Halo! Saya adalah customer service MenoPal. Saya akan membantu Anda lebih lanjut. Apakah ada yang ingin Anda tanyakan secara spesifik tentang kesehatan menstruasi atau gangguan tertentu yang Anda alami?`
                    );
                }, 5000);
                userStep = 'awaiting_user_question';
            } else if (command === 'tidak') {
                await botBaileys.sendText(message.from, 'Terima kasih telah menggunakan MenoPal. Anda dapat kembali ke menu utama jika ingin memeriksa kategori lainnya.');
                await botBaileys.sendPoll(message.from, 'Apakah anda ingin kembali ke menu?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
                userStep = 'handle_menu_return';
            } else {
                await botBaileys.sendPoll(message.from, 'Ada yang ingin ditanyakan?', {
                    options: ['Iya', 'Tidak'],
                    multiselect: false
                });
            }
            break;

        case 'handle_menu_return':
            if (command === 'iya') {
                await botBaileys.sendPoll(message.from, 'Pilih Kategori:', {
                    options: ['Siklus', 'Volume', 'Lama', 'Gangguan Lain'],
                    multiselect: false
                });
                userStep = 'category_selection';
            } else if (command === 'tidak') {
                await botBaileys.sendText(
                    message.from,
                    'Terima kasih telah menggunakan MenoPal. Semoga hari Anda menyenangkan. Jika anda berkenan mengisi survei mengenai menstruasi perempuan , silakan klik link berikut: https://forms.gle/NBRcZ1yBZHuvnLgs5'
                );
                userStep = 'end';
            }
            break;

        case 'awaiting_user_question':
            if (command) {
                await botBaileys.sendText(
                    message.from,
                    `Terima kasih atas pertanyaannya. Kami sedang meninjau dan akan memberikan informasi yang relevan secepatnya.`
                );
                userStep = 'end';
            } else {
                await botBaileys.sendText(
                    message.from,
                    `Maaf, kami belum menerima pertanyaan yang spesifik. Silakan tanyakan apa yang ingin Anda ketahui.`
                );
            }
            break;

        case 'end':
            await botBaileys.sendText(
                message.from,
                `Terima kasih atas waktunya, semoga hari anda menyenangkan.`
            );
            userStep = 'initial_response';
            break;

        default:
            await botBaileys.sendText(message.from, 'Jika ada yang ingin ditanyakan, silakan ketik tanya.');
            break;
    }
});

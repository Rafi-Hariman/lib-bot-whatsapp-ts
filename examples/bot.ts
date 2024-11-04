import { BaileysClass } from '../lib/baileys.js';

const botBaileys = new BaileysClass({});
let awaitingResponse = false;
let userStep = 'welcome';

botBaileys.on('auth_failure', async (error) => console.log("ERROR BOT: ", error));
botBaileys.on('qr', (qr) => console.log("NEW QR CODE: ", qr));
botBaileys.on('ready', async () => console.log('READY BOT'));

botBaileys.on('message', async (message) => {
    const positiveResponses = require('../user-response/confirmResponse.json');

    const command = message.body.toLowerCase().trim();

    switch (userStep) {
        case 'welcome':
            await botBaileys.sendText(message.from, `Selamat datang di MenoPal, ${message.from}. MenoPal adalah chatbot interaktif yang dapat membantu Anda dalam mengetahui dan menentukan gangguan pada menstruasi. Apakah Anda tertarik untuk menggunakan bot ini?`);
            userStep = 'initial_response';
            break;


        case 'initial_response':
            if (positiveResponses.includes(command.toLowerCase())) {
                await botBaileys.sendText(
                    message.from,
                    `Baik ${message.from}, sebelum menggunakan fitur MenoPal ini, silahkan isi link berikut https://forms.gle/NBRcZ1yBZHuvnLgs5.`
                );

                // Set timeout for sending the poll after 20 seconds
                setTimeout(async () => {
                    await botBaileys.sendPoll(message.from, 'Apakah Anda sudah mengisi Form:', {
                        options: ['Sudah', 'Belum'],
                        multiselect: false
                    });
                    userStep = 'form_confirmation'; // Set the next step to handle the poll response
                }, 20 * 1000); // 20 seconds delay

                userStep = 'waiting_for_poll_response'; // Indicate waiting for the poll response
            } else {
                await botBaileys.sendText(
                    message.from,
                    'Terima kasih sudah menggunakan MenoPal.'
                );
                userStep = 'end';
            }
            break;



        case 'form_confirmation':
            if (command.toLowerCase() === 'sudah') {
                await botBaileys.sendText(message.from, `Terima kasih sudah mengisi form. Untuk mengetahui gangguan menstruasi, pilih kategori di bawah ini.`);
                await botBaileys.sendPoll(message.from, 'Pilih Kategori:', {
                    options: ['Siklus', 'Volume', 'Lama', 'Gangguan Lain'],
                    multiselect: false
                });
                userStep = 'category_selection';
            } else if (command.toLowerCase() === 'belum') {
                await botBaileys.sendText(message.from, 'Silakan isi form terlebih dahulu sebelum melanjutkan.');
                userStep = 'end'; // End the interaction or redirect as needed
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
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Polimenorhea. polimenorhea merupakan ganguan menstruasi yang ditandai dengan siklus haid yang kurang dari 21 hari dan perdarahan yang lebih sedikit. Diperlukan konsulasi ke dokter jika anda mengalami tanda-tanda diatas. Ada yang ingin ditanyakan?”');
                userStep = 'inquiry';
            } else if (command === 'siklus menstruasi lebih dari 35 hari') {
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Oligomenorhea. Oligomenorrhea adalah Menstruasi yang jarang atau sangat sedikit, atau lebih tepatnya periode menstruasi yang berlangsung lebih dari 35 hari, disebut oligomenore. Berbagai kondisi, termasuk PCOS, Sindrom Prader-Will, fluktuasi hormon perimenopause, gangguan makan termasuk bulimia nervosa dan anoreksia nervosa, dan lain-lain, dapat menjadi penyebabnya.Diperlukan konsulasi ke dokter jika anda mengalami tanda-tanda diatas.Ada yang ingin ditanyakan?”');
                userStep = 'inquiry';
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
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Hipermonorea. Hipermenorea adalah kondisi medis yang ditandai dengan perdarahan haid yang lebih banyak atau lebih lama dari normal. Dan lamanya lebih dari 8 hari.Diperlukan konsulasi ke dokter jika anda mengalami tanda-tanda diatas.Ada yang ingin ditanyakan?”');
                userStep = 'inquiry';
            } else if (command === 'perdarahan sedikit (siklus menstruasi lebih dari 35 hari)') {
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Oligomenorhea. Oligomenorrhea adalah Menstruasi yang jarang atau sangat sedikit, atau lebih tepatnya periode menstruasi yang berlangsung lebih dari 35 hari, disebut oligomenore. Berbagai kondisi, termasuk PCOS, Sindrom Prader-Will, fluktuasi hormon perimenopause, gangguan makan termasuk bulimia nervosa dan anoreksia nervosa, dan lain-lain, dapat menjadi penyebabnya.Diperlukan konsulasi ke dokter jika anda mengalami tanda-tanda diatas.Ada yang ingin ditanyakan?”');
                userStep = 'inquiry';
            }
            break;

        // Lama Category
        case 'lama_category':
            if (command === 'lama menstruasi lebih dari 8 hari') {
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Hipermonorea. Hipermenorea adalah kondisi medis yang ditandai dengan perdarahan haid yang lebih banyak atau lebih lama dari normal. Dan lamanya lebih dari 8 hari.Diperlukan konsulasi ke dokter jika anda mengalami tanda-tanda diatas.Ada yang ingin ditanyakan?”');
                userStep = 'inquiry';
            } else if (command === 'lama menstruasi kurang dari 3 hari') {
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Hipomenorea.Hipomenorea adalah perdarahan haid yang lebih sedikit dari biasanya yaitu terjadinya perdarahan menstruasi yang lebih sedikit dari volume normal dan lamanya kurang dari 3 hari.Diperlukan konsulasi ke dokter jika anda mengalami tanda-tanda diatas.Ada yang ingin ditanyakan?”');
                userStep = 'inquiry';
            }
            break;

        // Gangguan Lain Category
        case 'other_category':
            if (command === 'kram perut bagian bawah, nyeri punggung, mual muntah, diare') {
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Dismenorea.Dismenorea merupakan salah satu masalah yang dihadapi wanita saat menstruasi, berupa sakit perut, kram, dan nyeri punggung adalah beberapa gejala yang dapat mempersulit aktivitas sehari-hari. Nyeri yang tajam dan sporadis serta kram di perut bagian bawah adalah gejala umum dismenorea, dan biasanya berpindah ke punggung, paha, selangkangan, dan vulva.  Biasanya dimulai sehari sebelum atau tepat sebelum aliran menstruasi dimulai, nyeri ini biasanya memuncak dalam sehari. Dan beberapa gejala lain seperti Sering buang air kecil (darah dalam urin), mual, muntah, diare, migrain, menggigil, kembung, nyeri payudara, sedih, dan mudah tersinggung adalah beberapa gejalanya.Upaya penanganan dismenorea :1. Kompres hangat2. Senam dismenorea3. Pengalihan rasa sakit4. Masase5. Relaksasi aromaterapi6. Pola makan sehat7. Obat pereda nyeriAda yang ingin ditanyakan?”');
                userStep = 'inquiry';
            } else if (command === 'malas bergerak, nyeri payudara, muncul jerawat, nafsu makan meningkat') {
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Premenstrual SyndromePremenstrual Syndrome (PMS) adalah kelainan di mana tubuh menunjukkan sejumlah gejala yang berhubungan dengan siklus menstruasi. Gejala sering kali mulai terlihat 7-10 hari sebelum dimulainya siklus menstruasi dan hilang begitu siklus menstruasi dimulai. Gejala Premenstrual Syndrome adalah :1. Fisik: Nyeri payudara, penambahan berat badan, sakit kepala, edema, kram perut, kembung, jerawat, nyeri otot, diare, atau bahkan sembelit adalah beberapa perubahan fisik yang berhubungan dengan PMS.2. Psikologis: kelupaan, kelelahan, kesulitan fokus, nafsu makan meningkat.3. Perilaku : Mudah tersinggung, menangis tersedu- sedu, cemas, susah tidur, gairah seks meningkat, dan depresi merupakan tanda-tanda perubahan emosi saat PMS.Upaya penanganan :PMS sulit dihindari karena tidak ada yang tahu apa penyebabnya. Mempertahankan gaya hidup sehat adalah pendekatan paling efektif untuk menurunkan peluang Anda terkena PMS.Ada yang ingin ditanyakan?”');
                userStep = 'inquiry';
            }
            break;

        // Amenorrhea Check
        case 'amenorrhea_check':
            if (command === 'pernah') {
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Amenenorhea sekunder. Amemenorrhea sekunder adalah,  kondisi Ketika seorang Wanita yang sudah pernah mengalami menstruasi tidak menstruasi selama lebih dari tiga bulan berturu-turut.Diperlukan konsulasi ke dokter jika anda mengalami tanda-tanda diatas.Ada yang ingin ditanyakan?”');
            } else {
                await botBaileys.sendText(message.from, '“Gangguan menstruasi berupa Amemenorhea primerAmenorea primer adalah kondisi ketika seorang wanita belum m engalami menstr asi pertamanya pada usia 15 tahun atau 3 tahun setelah menarche, meskipun sudah mengalami perkembangan normal dan karakteristik seksual sekunderDiperlukan konsulasi ke dokter jika anda mengalami tanda-tanda diatas.Ada yang ingin ditanyakan?”');
            }
            userStep = 'inquiry';
            break;

        // Inquiry Handling
        case 'inquiry':
            if (command === 'yes') {
                await botBaileys.sendText(message.from, 'Baik, MenoPal akan menyambungkan ke customer service. Mohon tunggu.');
                userStep = 'end';
            } else {
                await botBaileys.sendText(message.from, 'Terima kasih telah menggunakan MenoPal. Anda dapat kembali ke menu utama jika ingin memeriksa kategori lainnya.');
                userStep = 'end';
            }
            break;

        case 'end':
            awaitingResponse = false;
            userStep = 'welcome';
            break;

        default:
            await botBaileys.sendText(message.from, 'Maaf, perintah tidak dikenali. Silakan pilih opsi yang tersedia.');
            break;
    }
});


// api/start-bot.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { exec } from 'child_process';

export default (req: VercelRequest, res: VercelResponse) => {
  exec('npm run example', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      res.status(500).send('Failed to start bot');
      return;
    }
    console.log(`Output: ${stdout}`);
    res.status(200).send('Bot started successfully');
  });
};

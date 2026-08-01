import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './src/app.js';
import { connectDatabase } from './src/config/db.config.js';

const start = async () => {
  await connectDatabase(process.env.MONGO_URI);

  const app = createApp();
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server is listening on PORT: ${port}`);
  });
};

start().catch(err => {
  console.error(`Could not start the server. Exiting now...\n${err}`);
  process.exit(1);
});

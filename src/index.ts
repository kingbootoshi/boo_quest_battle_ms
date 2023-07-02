import express from 'express';
import cors from 'cors';
import routes from '@/routes';
import dotenv from "dotenv"
dotenv.config()

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IP_ADDERSS = process.env.IP_ADDRESS || '127.0.0.1';

app.use(express.json());
app.use(cors());

app.use('/api', routes);

app.listen(PORT, IP_ADDERSS, () => {
	console.log('Listening on port ' + PORT);
});

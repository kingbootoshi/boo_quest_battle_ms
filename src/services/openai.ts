import { Configuration, OpenAIApi, ConfigurationParameters } from 'openai';
import { config } from 'dotenv';

config();

const openAiConfig: ConfigurationParameters = {
	apiKey: process.env.OPENAI_KEY,
};

if (process.env.OPENAI_ORG) {
	openAiConfig.organization = process.env.OPENAI_ORG;
}

const configuration = new Configuration(openAiConfig);
const openai = new OpenAIApi(configuration);

export default openai;

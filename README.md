# Google-TTS Telegram Bot

This project is a Telegram bot that converts text to speech using Google's Text-to-Speech API. The bot is built with Node.js and uses several packages including `node-telegram-bot-api`, `google-tts-api`, `fs`, `uuid`, and `moment`.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/ReactMVC/Google-TTS.git
```

2. Navigate to the project directory
```bash
cd Google-TTS
```

3. Install the dependencies
```bash
npm install
```

### Configuration

1. Open the `index.js` file and replace `"YOUR_BOT_TOKEN"` and `"YOUR_CHAT_ID"` with your Telegram bot token and chat ID respectively.

2. If you want to add more languages, you can edit the `lang.json` file. The format is as follows:
```json
{
    "name": "Language Name",
    "code": "Language Code"
}
```

### Running the Bot

To start the bot, run the following command in your terminal:
```bash
npm start
```
or
```bash
node index.js
```

## Usage

Once the bot is running, you can interact with it on Telegram. The bot supports the following commands:

- `/start`: Starts the bot and displays the main menu.
- `Text to Speech`: Converts the provided text to speech in the selected language and format.
- `Support`: Sends a support message to the admin.

## Learning More

To learn more about the code and how it works, you can read through the `index.js` file. It contains comments explaining what each part of the code does.

## Contact

For any questions or concerns, you can reach out to the developer:

- Name: Hossein Pira
- Email: h3dev.pira@gmail.com
- Telegram: [@h3dev](https://t.me/h3dev)

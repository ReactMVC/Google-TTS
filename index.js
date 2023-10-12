const TelegramBot = require("node-telegram-bot-api");
const googleTTS = require("google-tts-api");
const fs = require("fs");
const uuid = require("uuid");
const moment = require("moment");

const token = "YOUR_BOT_TOKEN";
const adminID = "YOUR_CHAT_ID";

const bot = new TelegramBot(token, { polling: true });

let userState = {};
let userLang = {};
let userText = {};
let userFormat = {};

const languages = require("./lang.json");

function handleStart(msg) {
    const chatId = msg.chat.id;
    userState[chatId] = "start";
    bot.sendMessage(
        chatId,
        "Hello! You can use this robot to convert endless text to sound. Click on 'Text to Speech' or 'Support' button to use.",
        {
            reply_markup: {
                keyboard: [["Text to Speech"], ["Support"]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
            reply_to_message_id: msg.message_id,
        }
    );
}

bot.onText(/\/start/, handleStart);

bot.on("message", (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === "Text to Speech") {
        userState[chatId] = "selectingLanguage";
        const keyboard = languages
            .map((language) => [language.name])
            .concat([["Cancel"]]);
        bot.sendMessage(chatId, "Please select your language.", {
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true,
                one_time_keyboard: true,
            },
            reply_to_message_id: msg.message_id,
        });
    } else if (msg.text === "Support") {
        userState[chatId] = "support";
        bot.sendMessage(chatId, "Please enter your support message.", {
            reply_markup: {
                keyboard: [["Cancel"]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
            reply_to_message_id: msg.message_id,
        });
    } else if (msg.text === "Cancel") {
        handleStart(msg);
    } else if (userState[chatId] === "selectingLanguage") {
        const selectedLanguage = languages.find(
            (language) => language.name === msg.text
        );
        if (selectedLanguage) {
            userLang[chatId] = selectedLanguage.code;
            userState[chatId] = "enteringText";
            bot.sendMessage(chatId, "Please enter your text.", {
                reply_markup: {
                    keyboard: [["Cancel"]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
                reply_to_message_id: msg.message_id,
            });
        } else {
            bot.sendMessage(
                chatId,
                "Invalid language. Please select a valid language.",
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    } else if (userState[chatId] === "enteringText") {
        userText[chatId] = msg.text;
        userState[chatId] = "selectingFormat";
        bot.sendMessage(
            chatId,
            "Please select your format (mp3, ogg, webm, m4a).",
            {
                reply_markup: {
                    keyboard: [["mp3"], ["ogg"], ["webm"], ["m4a"], ["Cancel"]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
                reply_to_message_id: msg.message_id,
            }
        );
    } else if (userState[chatId] === "selectingFormat") {
        if (["mp3", "ogg", "webm", "m4a"].includes(msg.text)) {
            userFormat[chatId] = msg.text;
            userState[chatId] = "processing";

            googleTTS
                .getAudioBase64(userText[chatId], {
                    lang: userLang[chatId],
                    slow: false,
                    host: "https://translate.google.com",
                    timeout: 86400000,
                })
                .then((base64) => {
                    const audio = Buffer.from(base64, "base64");
                    const randomName = uuid.v4();
                    const fileName = `${randomName}-${moment().format(
                        "YYYY-MM-DD-HH-mm-ss"
                    )}.${userFormat[chatId]}`;
                    fs.writeFileSync(fileName, audio);

                    bot.sendAudio(chatId, fileName, {
                        caption: "make by @nodegooglebot",
                    }).then(() => {
                        fs.unlinkSync(fileName);
                        handleStart(msg);
                    });
                })
                .catch((err) => {
                    bot.sendMessage(
                        chatId,
                        `An error occurred: ${err.message}`,
                        {
                            reply_to_message_id: msg.message_id,
                        }
                    );
                    handleStart(msg);
                });
        } else {
            bot.sendMessage(
                chatId,
                "Invalid format. Please select mp3, ogg, webm, or m4a.",
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    } else if (userState[chatId] === "support" && msg.text !== "/start") {
        const userFirstName = msg.from.first_name;
        const userLastName = msg.from.last_name || "";
        const userId = msg.from.id;
        const userMessage = msg.text;

        const supportMessage = `New message!\n\nFrom: ${userFirstName} ${userLastName}\nUsername: ${userId}\n\nMessage:\n${userMessage}`;

        bot.sendMessage(adminID, supportMessage).then(() => {
            bot.sendMessage(
                chatId,
                "Your message has been sent. Thank you for your feedback!",
                {
                    reply_to_message_id: msg.message_id,
                }
            );
            handleStart(msg);
        });
    }
});

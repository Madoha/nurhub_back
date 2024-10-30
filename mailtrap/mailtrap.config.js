const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const dotenv = require("dotenv");

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

export const mailtrapClient = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

export const sender = {
    address: "hello@demomailtrap.com",
    name: "Mailtrap Test",
  };
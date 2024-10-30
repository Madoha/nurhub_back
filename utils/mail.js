const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const dotenv = require("dotenv");

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

const sender = {
  address: "hello@demomailtrap.com",
  name: "Mailtrap Test",
};
const recipients = [
  "honkaimadoha2@gmail.com",
];

transport
  .sendMail({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    html: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then(console.log, console.error);
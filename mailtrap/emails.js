const catchAsync = require("../utils/catchAsync");
const { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } = require("./emailTemplates");
const { mailtrapClient, sender } = require("./mailtrap.config");

const sendPasswordResetEmail = catchAsync(async (email, resetUrl) => {
    const recipients = [ email ];

    const response = await mailtrapClient.sendMail({
        from: sender,
        to: recipients,
        subject: "Reset your password",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetUrl}", resetUrl),
        category: "Password Reset"
      });

    console.log('response', response);
});

const sendResetSuccessEmail = catchAsync(async (email) => {
    const recipients = [ email ];

    const response = await mailtrapClient.sendMail({
        from: sender,
        to: recipients,
        subject: "Password Reset Successful",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "Password Reset"
      });
});

module.exports = { sendPasswordResetEmail, sendResetSuccessEmail };
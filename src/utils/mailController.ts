import nodemailer from "nodemailer";
import { Request, Response } from "express";

const password = "jeauzlwlsfphpkgi";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jamb@jambpm.com", // Your Google Workspace email
    pass: password, // App password generated above
  },
});

export const sendEmailFunc = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    console.log("... sending mail");
    const info = await transporter.sendMail({
      from: "jamb@jambpm.com",

      to,
      subject,

      html,
    });

    console.log("Message sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    return error;
    //throw error;
  }
};

import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

type SendEmailOptions = {
  to: string;
  subject: string;
  body: string;
  firstName?: string | null;
  contactId: string;
  campaignId: string;
};


const wrapLinks = (body: string, contactId: string, campaignId: string): string => {
  const urlRegex = /(https?:\/\/[^\s<>"]+)/g
  return body.replace(urlRegex, (url) => {
    const encoded = encodeURIComponent(url)
    return `${env.APP_URL}/api/track/click?cid=${contactId}&tid=${campaignId}&url=${encoded}`
  })
}

export const sendEmail = async (options: SendEmailOptions) => {
  const greeting = options.firstName
    ? `Hi ${options.firstName} ,`
    : `Hi there,`;

  const pixelUrl = `${env.APP_URL}/api/track/open?cid=${options.contactId}&tid=${options.campaignId}`;

  const trackedBody = wrapLinks(options.body, options.contactId, options.campaignId)

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>${greeting}</p>
      <div>${trackedBody}</div>
      <hr style="margin-top: 40px;" />
      <p style="font-size: 12px; color: #999;">
        You received this email because you are on our mailing list.
      </p>
      <img 
        src="${pixelUrl}" 
        width="1" 
        height="1" 
        style="display:block;width:1px;height:1px;border:0;"
      />
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"MultiMail" <${env.SMTP_FROM}>`,
    to: options.to,
    subject: options.subject,
    text: `${greeting}\n\n${options.body}`,
    html,
  });

  return info.messageId;
};
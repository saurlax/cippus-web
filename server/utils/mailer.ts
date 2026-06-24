import nodemailer from "nodemailer";

let transporterPromise:
  | Promise<ReturnType<typeof nodemailer.createTransport> | null>
  | undefined;

function toBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "true" || normalized === "1";
}

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const config = useRuntimeConfig();
      const host = String(config.mailHost || "").trim();
      const user = String(config.mailUser || "").trim();
      const pass = String(config.mailPass || "").trim();
      const from = String(config.mailFrom || "").trim();

      if (!host || !user || !pass || !from) {
        return null;
      }

      return nodemailer.createTransport({
        host,
        port: Number(config.mailPort || 587),
        secure: toBoolean(config.mailSecure),
        auth: {
          user,
          pass,
        },
      });
    })();
  }

  return await transporterPromise;
}

export async function sendEmail(input: {
  to?: string | string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
}) {
  const transporter = await getTransporter();
  if (!transporter) {
    return false;
  }

  const config = useRuntimeConfig();
  const fromAddress = String(config.mailFrom || "").trim();
  const fromName = String(config.mailFromName || "").trim();

  try {
    await transporter.sendMail({
      from: fromName ? `"${fromName}" <${fromAddress}>` : fromAddress,
      to: input.to,
      bcc: input.bcc,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return true;
  } catch (error) {
    console.error("failed to send email", error);
    return false;
  }
}

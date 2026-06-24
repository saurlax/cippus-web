export async function sendEmail(input: {
  to?: string | string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
}) {
  const { sendMail, nodemailer } = useNodeMailer();
  const config = (nodemailer || {}) as {
    host?: string;
    from?: string;
  };

  if (!String(config.host || "").trim() || !String(config.from || "").trim()) {
    return false;
  }

  try {
    await sendMail({
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

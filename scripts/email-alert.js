import fs from "fs";
import nodemailer from "nodemailer";

const [, , ts, logfile] = process.argv;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const to = process.env.ALERT_EMAIL || user;

if (!user || !pass) {
  console.error("SMTP creds missing – alert skipped");
  process.exit(0);
}

const body = fs.readFileSync(logfile, "utf8");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

await transporter.sendMail({
  from: `"VARCAVIA Bot" <${user}>`,
  to,
  subject: `❌ VARCAVIA update FAILED (${ts})`,
  text: body.slice(-5000),
});

console.log("📧 Alert e-mail inviata a", to);

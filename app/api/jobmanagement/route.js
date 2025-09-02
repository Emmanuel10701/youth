import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { jobId, reason, companyEmail } = await request.json();

    if (!jobId || !reason || !companyEmail) {
      return NextResponse.json({ error: "Job ID, reason, and company email are required." }, { status: 400 });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error("EMAIL_USER and EMAIL_PASS are not set");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });

    const mailOptions = {
      from: emailUser,
      to: companyEmail,
      subject: "Job Deletion Notification",
      text: `The job with ID ${jobId} has been deleted for the following reason: ${reason}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Notification sent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
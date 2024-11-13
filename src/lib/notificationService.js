import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { query } from './db';

const transporter = nodemailer.createTransport({
  host: process.env.BULK_EMAIL_HOST,
  port: process.env.BULK_EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.BULK_EMAIL_USER,
    pass: process.env.BULK_EMAIL_PASSWORD,
  },
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export const sendBulkNotifications = async (message, subject, type) => {
  
  try {
    // Fetch all users' emails and phone numbers
    const users = await query('SELECT email, phone FROM users');

    // Conditionally send notifications based on type
    if (type === 'email') {
      // Send Email notifications
      const emailPromises = users.rows.map(user => {
        return transporter.sendMail({
          from: process.env.BULK_EMAIL_USER,
          to: user.email,
          subject: subject,
          text: message,
        }).catch(err => {
          console.error(`Error sending email to ${user.email}:`, err);
        });
      });

      await Promise.all(emailPromises);
      console.log('All emails sent successfully');
    } else if (type === 'sms') {
      // Send SMS notifications
      const smsPromises = users.rows.map(user => {
        if (user.phone) {
          return twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone,
          }).catch(err => {
            console.error(`Error sending SMS to ${user.phone}:`, err);
          });
        }
      });

      await Promise.all(smsPromises);
      console.log('All SMS sent successfully');
    } else {
      console.error('Invalid notification type. Please use "email" or "sms".');
    }
  } catch (error) {
    console.error('Error in sending bulk notifications:', error);
  }
};


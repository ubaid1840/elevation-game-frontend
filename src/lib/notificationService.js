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

    const users = await query('SELECT email, phone FROM users');


    if (type === 'email') {

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


export const sendSingleEmail = async (message, subject, id) => {
  try {
    const usersQuery = await query('SELECT email FROM users WHERE id = $1 LIMIT 1', [id]);
    const user = usersQuery.rows[0];

    if (user?.email) {
      await transporter.sendMail({
        from: process.env.BULK_EMAIL_USER,
        to: user.email,
        subject,
        text: message,
      });

      console.log(`Email sent successfully to ${user.email}`);
    } else {
      console.log(`User with id ${id} not found or missing email.`);
    }
  } catch (error) {
    console.log('Error in sending email:', error);
  }
};


export const sendSingleSMS = async (message, id) => {
  try {
    const usersQuery = await query('SELECT phone FROM users WHERE id = $1 LIMIT 1', [id]);
    const user = usersQuery.rows[0];

    if (user.phone) {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone,
      })
    } else {
      console.log(`User with id ${id} not found or missing phone.`);
    }
  } catch (error) {
    console.log('Error in sending sms:', error);
  }
};


import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { query } from './db';
import { addInOverallLogs } from '@/app/api/notification/route';

const transporter = nodemailer.createTransport({
  host: process.env.BULK_EMAIL_HOST,
  port: process.env.BULK_EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.BULK_EMAIL_USER,
    pass: process.env.BULK_EMAIL_PASSWORD,
  },
});

const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

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
            // messagingServiceSid : process.env.TWILIO_TWILIO_MESSAGING_SERVICE_SID,
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


export async function sendSingleEmail(message, subject, id) {
  await addInOverallLogs({}, "notification service", "starting sending email to " + id)
  try {
    const usersQuery = await query('SELECT email FROM users WHERE id = $1 LIMIT 1', [id]);

    const user = usersQuery.rows[0];
    await addInOverallLogs(user, "notification service", "found user for email with " + id)
    if (user?.email) {
      await addInOverallLogs(user, "notification service", "sending email to " + user.email)
      await transporter.sendMail({
        from: process.env.BULK_EMAIL_USER,
        to: user.email,
        subject,
        text: message,
      });

      await query(
        'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
        [Number(id), `Email sent successfully to ${user.email}`]
      );
      await addInOverallLogs(user, "notification service", "Email sent to " + user.email)
      console.log(`Email sent successfully to ${user.email}`);
    } else {
      await addInOverallLogs({}, "notification service", `User with id ${id} not found or missing email`)
      console.log(`User with id ${id} not found or missing email.`);
    }
  } catch (error) {
    console.log('Error in sending email:', error);
    await addInOverallLogs(error, "notification service", "email sending failed to" + id)
    await query(
      `INSERT INTO error_logs (message, type) VALUES ($1, $2)`,
      [JSON.stringify(error), "email"]
    );
  }
};


export const sendSingleSMS = async (message, id) => {
   await addInOverallLogs({}, "notification service", "starting sending sms to " + id)

  try {

    const usersQuery = await query('SELECT phone FROM users WHERE id = $1 LIMIT 1', [id]);
    const user = usersQuery.rows[0];
     await addInOverallLogs(user, "notification service", "found user for sms with " + id)
    if (user.phone) {
      await addInOverallLogs(user, "notification service", "Sending sms to " + user.phone)
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone,
      })
      await addInOverallLogs(user, "notification service", "SMS sent to " + user.phone)
      await query(
        'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
        [Number(id), `SMS sent successfully to ${user.phone}`]
      );
      console.log(`SMS sent successfully to ${user.phone}`);
    } else {
      await addInOverallLogs({}, "notification service", `User with id ${id} not found or missing phone`)
      console.log(`User with id ${id} not found or missing phone.`);
    }
  } catch (error) {
    await addInOverallLogs(error, "notification service", "sms sending failed to" + id)
    console.log('Error in sending sms:', error);
    await query(
      `INSERT INTO error_logs (message, type) VALUES ($1, $2)`,
      [JSON.stringify(error), "sms"]
    );
  }
};


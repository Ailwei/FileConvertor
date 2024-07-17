const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
   user: process.env.USER,
   pass: process.env.PASSWORD_APP
  },
  tls: {
    rejectUnauthorized: false,
  },
});


const sendConfirmationEmail = (email, subject, text) => {
  const mailOptions = {
    from: 'No Reply <no-reply@test.com>',
    to:email,
    subject,
    text,
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = {
  sendConfirmationEmail,
};

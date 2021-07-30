const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = (to, msg) => {
    const msgDetails = {
        from: 'neriyarden@gmail.com',
        to,
        ...msg
    }
    sgMail.send(msgDetails, (err, info) => {
        console.log('msgDetails:', msgDetails);
        if (err) console.log('Email not set. Error:', err)
        else console.log('Email sent successfully.', info);;
    })
}


module.exports = sendEmail


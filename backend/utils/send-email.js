const resend = require('../lib/resend-client')

const sendEmail = async (email, movieName) => {
  try {
    const response = await resend.emails.send({
      from: 'Filmi9 <hello@filmi9.com>',
      to: email,
      subject: 'Filmi9 - Вашата заявка е изпълнена!',
      html: `
        <h1>Вашата заявка е изпълнена!</h1>
        <p>Можете да гледате ${movieName} от <a href="https://filmi9.com/">тук</a>.</p>
        <p>Благодарим ви, че използвате Filmi9!</p>

      `
    })
    return response
  } catch (error) {
    return error
  }
}

module.exports = sendEmail

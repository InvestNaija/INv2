import nodemailer from 'nodemailer';
import { MandrillTransport } from 'mandrill-nodemailer-transport';
import { ZeptomailTransport } from 'nodemailer-zeptomail-transport';
import fs from 'fs';
import handlebars from 'handlebars';

handlebars.registerHelper('breaklines', (text) => {
  text = handlebars.Utils.escapeExpression(text);
  text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
  return new handlebars.SafeString(text);
});

const zeptomail = new ZeptomailTransport({
  apiKey: process.env.MAIL_ZEPTO_KEY
})
// const mandrill = new MandrillTransport({
//   apiKey: process.env.MANDRILL_KEY!
// });
let transport = nodemailer.createTransport(zeptomail);

export const sendEmail = async  (options: any) => {
  const replacements = options;
  let url = new URL('/emailTemplates/', process.env.BACKEND_BASE).href;

  replacements.image =
    url +
    'assets/' +
    (options.images
      ? options.images[Math.floor(Math.random() * options.images.length)]
      : Math.floor(Math.random() * 10) + 1 + '.jpg');
  replacements.url = url;

  let templatePath =
    __path.join(__dirname, '../', `/public/templates/${options.template ? options.template : 'default.html'}`);

  templatePath = templatePath.replace('config', '');

  let html = fs.readFileSync(templatePath, 'utf-8');
  let template = handlebars.compile(html);
  let htmlToSend = template(replacements);
  let mailOptions = {
    // from: 'InvestNaija <info@investnaija.com>',
    from: options.sender,
    to: options.email,
    subject: options.subject,
    replyTo: options.replyTo,
    html: htmlToSend,
    attachments: options.attachments,
  };

  // transport.sendMail(mailOptions)
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log('Error Sending Email with Template: ', error);
      console.log(options.template ? options.template : 'default.html');
      // throw error;
      return;
    }
    console.log('Message sent: ' + JSON.stringify(response));
  });
};

import fs from 'fs';
import Mustache from 'mustache';

const createEmailBody = (userData) => {
  var path = __dirname + '//email-template.html';
  fs.readFile(path, 'utf8', function (err, template) {
    if (err) {
      context.log.error(err);
      context.done(err);
    }

    var rendered = Mustache.render(template, userData);

    return [rendered, userData.overrideEmail];
  });
};

export default async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  return createEmailBody(req.body)
    .then((emailBody, overrideEmail) => {
      return {
        personalizations: [
          {
            to: [{ email: overrideEmail ?? "greenawaybb@gmail.com" }]
          }
        ],
        from: { email: "jose.e.chavez@gmail.com" },
        subject: "Dover Credit Application POC",
        content: [{
          type: 'text/html',
          value: emailBody,
        }]
      };
    })
    .then((message) => {
      context.res = {
        status: 200,
        body: "Credit Application mailed successfully",
      };
      
      return message;
    })
    .then((message) => context.done(null, message))
    .then(message => { return message; });
};

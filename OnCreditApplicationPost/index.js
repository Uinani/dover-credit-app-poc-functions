const {
  Aborter,
  StorageURL,
  ServiceURL,
  ShareURL,
  DirectoryURL,
  FileURL,
  SharedKeyCredential,
} = require("@azure/storage-file");
const Mustache = require('mustache');

// A helper method used to read a Node.js readable stream into string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

const createEmailBody = async (userData) => {
  const account = process.env.AzureStorageAccountName;
  const accountKey = process.env.AzureStorageAccessKey;

  const sharedKeyCredential = new SharedKeyCredential(account, accountKey);
  const pipeline = StorageURL.newPipeline(sharedKeyCredential);
  const serviceURL = new ServiceURL(
    // When using AnonymousCredential, following url should include a valid SAS
    `https://${account}.file.core.windows.net`,
    pipeline
  );

  const shareName = 'dover-credit-fs-public';
  const shareURL = ShareURL.fromServiceURL(serviceURL, shareName);

  const directoryName = 'emailTemplates';
  const directoryURL = DirectoryURL.fromShareURL(shareURL, directoryName);
  
  const fileName = 'email-template.html';
  const fileURL = FileURL.fromDirectoryURL(directoryURL, fileName);
  
  const downloadFileResponse = await fileURL.download(Aborter.none, 0);

  const template = await streamToString(downloadFileResponse.readableStreamBody);

  var rendered = Mustache.render(template, userData);

  return [rendered, userData.overrideEmail];
};

module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  return createEmailBody(req.body)
    .then(([emailBody, overrideEmail]) => {
      var email = overrideEmail ? overrideEmail : "greenawaybb@gmail.com";
      
      return {
        personalizations: [
          {
            to: [{ email }]
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

const fieldMappings = {
    firstName: 'First Name',
    lastName: 'Last Name',
    addressLine1: 'Address Line 1',
    addressLine2: 'Address Line 2',
    city: 'City',
    state: 'State',
    zipCode: 'Zip Code',
    employerName: 'Employer Name',
    yearsEmployed: 'Years Employed',
    yearlySalary: 'Yearly Salary',
    email: 'E-Mail Address',
    creditCheckAgreement: 'Agrees to Credit Check?',
};

const createEmailBody = (userData) => {
    var emailBody = '<p>A credit application has been submitted with the following information:</p><br/>';

    emailBody += '<table>';

    for (const property in userData) {
        emailBody += `<tr><td>${fieldMappings[property]}</td><td>${userData[property]}</td></tr>`
    }

    emailBody += '</table>';

    return emailBody;
};

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var userData = req.body;

    var emailBody = createEmailBody(userData);

    var message = {
        personalizations: [
            {
                to: [ { email: "jose.e.chavez@outlook.com" } ]
            } 
        ],
        from: { email: "no-reply@uinani.com" },
        subject: "Dover Credit Application POC",
        content: [{
            type: 'text/html',
            value: emailBody,
        }]
    };

    context.res = {
        status: 200,
        body: "Credit Application mailed successfully",
    }

    context.done(null, message);
   
    return message;
};

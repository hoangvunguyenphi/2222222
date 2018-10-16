var AWS = require("aws-sdk");
const awsconfig = require('../../../aws-config.json');
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
const region = awsconfig.AWS.region;
AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
});
let docClient = new AWS.DynamoDB.DocumentClient();
var params = {
    TableName: "DA2Book"
};
//DUYET TAT CA COLLECTIONS TREN TABLE
docClient.scan(params, onScan);

function onScan(err, data) {
    if (err) {
        console.error(
            "\nUnable to scan the table. Error JSON:",
            JSON.stringify(err, null, 2)
        );
        res.render("error");
    } else {
        console.log(data);
    }
}
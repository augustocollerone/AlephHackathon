const { Defender } = require("@openzeppelin/defender-sdk");

exports.handler = async function (payload) {
  console.log(payload.request.body);

  const creds = {
    apiKey: "RdxcMWTQotk8TuRQtyz55NaxuotkwyZi",
    apiSecret:
      "2gi4R16ViNTy2NzH4CqSyMSqx4cnAQMSp9YjFtjFfJeDv4knbcHSB3HzLpMdpe58",
    //optional https config to keep connection alive. You can pass any configs that are accepted by https.Agent
    httpsAgent: https.Agent({ keepAlive: true }),
  };
  const client = new Defender(creds);

  const conditionRequest = payload.request.body;
  const matches = [];
  const eventHash = conditionRequest.hash;

  // Inline code for the scheduled action
  const codeToRun = `
  const { Defender } = require('@openzeppelin/defender-sdk');
  const { ethers } = require('ethers');

  exports.handler = async function(credentials) {
    const client = new Defender(credentials);

    const provider = new ethers.providers.Web3Provider(client);
    const signer = provider.getSigner();

    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contractABI = ["function feeToken() view returns (address)"];
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const feeTokenAddress = await contract.feeToken();
    console.log(\`The feeToken address is: \${feeTokenAddress}\`);
    return feeTokenAddress;
  };
`;

  const myScheduledAction = {
    name: `Scheduled-Action-For-Task`,
    encodedZippedCode: Buffer.from(codeToRun).toString("base64"), // Encode the inline code
    trigger: {
      type: "schedule",
      frequencyMinutes: 60, // Set the frequency as needed
    },
    paused: false,
    environmentVariables: {
      CONTRACT_ADDRESS: eventHash,
    },
  };

  const createdAction = await client.action.create(myScheduledAction);
  console.log(`Scheduled action created: ${createdAction.name}`);

  // metadata can be any JSON-marshalable object (or undefined)
  //   matches.push({
  //     hash: event.hash,
  //     metadata: {
  //       id: "customId",
  //       timestamp: new Date().getTime(),
  //       numberVal: 5,
  //       nested: { example: { here: true } },
  //     },
  //   });
  //   return { matches };
};

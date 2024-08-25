const { Defender } = require("@openzeppelin/defender-sdk");

exports.handler = async function (event) {
  console.log(event);

  const client = new Defender(event.credentials);
  const conditionRequest = payload.request.body;
  const matches = [];
  const events = conditionRequest.events;
  for (const evt of events) {
    // add custom logic for matching here

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
      name: `Scheduled-Action-For-Task-${evt.hash}`,
      encodedZippedCode: Buffer.from(codeToRun).toString("base64"), // Encode the inline code
      trigger: {
        type: "schedule",
        frequencyMinutes: 60, // Set the frequency as needed
      },
      paused: false,
      environmentVariables: {
        CONTRACT_ADDRESS: evt.hash,
      },
    };

    const createdAction = await client.action.create(myScheduledAction);
    console.log(`Scheduled action created: ${createdAction.name}`);

    // metadata can be any JSON-marshalable object (or undefined)
    matches.push({
      hash: evt.hash,
      metadata: {
        id: "customId",
        timestamp: new Date().getTime(),
        numberVal: 5,
        nested: { example: { here: true } },
      },
    });
  }
  return { matches };
};

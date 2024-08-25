const { Defender } = require("@openzeppelin/defender-sdk");

exports.handler = async function (payload) {
  const data = payload.request.body;
  console.log(data);

  const creds = {
    apiKey: "RdxcMWTQotk8TuRQtyz55NaxuotkwyZi",
    apiSecret:
      "2gi4R16ViNTy2NzH4CqSyMSqx4cnAQMSp9YjFtjFfJeDv4knbcHSB3HzLpMdpe58",
  };
  const client = new Defender(creds);

  if (data.matchReasons && Array.isArray(data.matchReasons)) {
    for (const reason of data.matchReasons) {
      const { user, taskId, name, amount, interval } = reason.params;
      console.log(reason.params);
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
          CONTRACT_ADDRESS: reason.address,
        },
      };

      try {
        const createdAction = await client.action.create(myScheduledAction);
        console.log(`Scheduled action created: ${createdAction.name}`);
      } catch (error) {
        console.log(`Error creating scheduled action: ${error}`);
      }
    }
  } else {
    console.log("No matchReasons found in the payload.");
  }
};

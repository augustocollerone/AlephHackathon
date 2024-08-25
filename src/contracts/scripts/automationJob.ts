import hre from "hardhat";

interface Task {
  user: string;
  taskId: bigint;
  name: string;
  amount: bigint;
  interval: bigint;
  count: number;
  maxCount: number;
  lastExecuted: bigint;
  active: boolean;
}

let tasks: Task[] = [];

const magicDcaContract = "0x16bCC9334f6e10b0293A4F9bec9eF058A1b7605a";
async function getAllDcaTasks(): Promise<Task[]> {
  const magicDCA = await hre.ethers.getContractAt("MagicDCA", magicDcaContract);

  // Create a filter for the DcaTaskCreated event
  const filter = magicDCA.filters.DcaTaskCreated();

  // Fetch all past events
  const events = await magicDCA.queryFilter(filter, 0, "latest");

  // Map the events to extract task details
  const tasks: Task[] = events.map((event) => ({
    user: event.args.user,
    taskId: event.args.taskId,
    name: event.args.name,
    amount: event.args.amount,
    interval: event.args.interval,
    count: 0,
    maxCount: 0,
    lastExecuted: BigInt(0),
    active: true,
  }));

  console.log(`Found ${tasks.length} tasks.`);

  return tasks;
}

async function updateTaskState(task: Task) {
  console.log(`Updating task state for task ${task.taskId}...`);
  const magicDCA = await hre.ethers.getContractAt("MagicDCA", magicDcaContract);

  const dcaTask = await magicDCA.dcaTasks(task.user, task.taskId);

  console.log(`Task ${task.taskId} state:`, dcaTask);

  task.count = parseInt(dcaTask.count.toString());
  task.maxCount = parseInt(dcaTask.maxCount.toString());
  task.lastExecuted = dcaTask.lastExecuted;
  task.active = dcaTask.active;
}

async function monitorNewTasks() {
  const magicDCA = await hre.ethers.getContractAt("MagicDCA", magicDcaContract);

  magicDCA.on(
    magicDCA.filters.DcaTaskCreated,
    (user, taskId, name, amount, interval) => {
      tasks.push({
        user,
        taskId,
        name,
        amount,
        interval,
        count: 0,
        maxCount: 0,
        lastExecuted: BigInt(0),
        active: true,
      });
      console.log(`New task created: ${taskId}`);
    }
  );
}

async function executeTask(task: Task) {
  if (task.active && task.count < task.maxCount) {
    console.log(`RUNNING Task ${task.taskId}`);
    try {
      const magicDCA = await hre.ethers.getContractAt(
        "MagicDCA",
        magicDcaContract
      );

      // const dedicatedMessageSigner = await magicDCA.dedicatedMsgSender();
      // // Impersonating dedicated sender's account
      // await hre.network.provider.request({
      //   method: "hardhat_impersonateAccount",
      //   params: [dedicatedMessageSigner],
      // });

      // const impersonatedExecuter = await hre.ethers.getSigner(
      //   dedicatedMessageSigner
      // );

      // // Connect executer to DCA contract
      // const newDCA = magicDCA.connect(impersonatedExecuter);

      const swapResults = await magicDCA.executeDcaTask(task.user, task.taskId); // Execute the task
      console.log(`Task ${task.taskId} executed successfully.\n\n`);

      // Update the task state after execution
      await updateTaskState(task);
    } catch (error) {
      console.error(`Error executing task ${task.taskId}:`, error);
    }
  } else {
    console.log(
      `Task ${task.taskId} is inactive or has reached its max count.`
    );
  }
}

async function checkTasks() {
  console.log("Starting to check tasks...");
  while (true) {
    for (const task of tasks) {
      await executeTask(task);
    }
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait one second before checking again
  }
}

async function main() {
  tasks = await getAllDcaTasks();

  // Update the state of each task
  for (const task of tasks) {
    await updateTaskState(task);
  }

  // Start monitoring for new tasks
  monitorNewTasks();

  // Start the loop to check tasks
  await checkTasks();
}

main()
  .then(() => console.log("Gelato bot script running in the background."))
  .catch((error) => {
    console.error("Error in Gelato bot script:", error);
    process.exit(1);
  });

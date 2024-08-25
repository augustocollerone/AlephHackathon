import hre from "hardhat";

interface Task {
  user: string;
  taskId: bigint;
  name: string;
  amount: bigint;
  interval: bigint;
  count: number;
  maxCount: number;
  lastExecuted: number;
  active: boolean;
}

let tasks: Task[] = [];

async function getAllDcaTasks(): Promise<Task[]> {
  const magicDcaContract = "0xD64616714b1E53643E1F97c8cCA235EAC2247BBa";
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
    lastExecuted: 0,
    active: true,
  }));

  console.log(`Found ${tasks.length} tasks.`);

  return tasks;
}

async function updateTaskState(task: Task) {
  console.log(`Updating task state for task ${task.taskId}...`);
  const magicDcaContract = "0xD64616714b1E53643E1F97c8cCA235EAC2247BBa";
  const magicDCA = await hre.ethers.getContractAt("MagicDCA", magicDcaContract);

  const dcaTask = await magicDCA.dcaTasks(task.user, task.taskId);

  task.count = parseInt(dcaTask.count.toString());
  task.maxCount = parseInt(dcaTask.maxCount.toString());
  task.lastExecuted = parseInt(dcaTask.lastExecuted.toString());
  task.active = dcaTask.active;
}

async function monitorNewTasks() {
  const magicDcaContract = "0xD64616714b1E53643E1F97c8cCA235EAC2247BBa";
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
        lastExecuted: 0,
        active: true,
      });
      console.log(`New task created: ${taskId}`);
    }
  );
}

async function executeTask(task: Task) {
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    task.active &&
    task.count < task.maxCount &&
    currentTime - task.lastExecuted >= task.interval
  ) {
    try {
      const magicDcaContract = "0xD64616714b1E53643E1F97c8cCA235EAC2247BBa";
      const magicDCA = await hre.ethers.getContractAt(
        "MagicDCA",
        magicDcaContract
      );

      const dedicatedMessageSigner = await magicDCA.dedicatedMsgSender();

      //  impersonating dedicated sender's account
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [dedicatedMessageSigner],
      });

      const empersonatedExecuter = await hre.ethers.getSigner(
        dedicatedMessageSigner
      );

      // Connect executer to DCA contract
      const newDCA = magicDCA.connect(empersonatedExecuter);

      await newDCA.executeDcaTask(task.user, task.taskId); // Replace with the function that needs to be executed
      console.log(`Task ${task.taskId} executed successfully.`);

      // Update the task state after execution
      await updateTaskState(task);
    } catch (error) {
      console.error(`Error executing task ${task.taskId}:`, error);
    }
  }
}

async function checkTasks() {
  console.log("Starting to check tasks...");
  while (true) {
    for (const task of tasks) {
      await executeTask(task);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait one second before checking again
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

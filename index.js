const core = require("@actions/core");
const github = require("@actions/github");

const TASK_LIST_ITEM_CHANGE_TYPE = /(?:^|\n)\s*-\s+\[([xX])\]\s+(\bScreen Change|PDF|103 XSL Update|Config|Performance|VB Custom Assembly|JS Custom Assembly)\b/g;
const SCREEN_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bScreen Status Validation|Object Properties Validation|Screen and Object Trigger\b)/g;
const PDF_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bForm Trigger in right order and scenario|Data Handling. For Example : mapping, clearing, font type, font size|Form's Doctype and docdesc definition in config file|Form's signature letiable is defined in Signature attribute\b)/g;
const ACORD_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bParty relation|Correct Tag name,value, and tc code according to BRD and project's ACORD version|Schema Validation\b)/g;
const PERFORMANCE_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bChrome Dev tool SLA <= 5s ?)/g;
const CONFIG_TAKS_LIST_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bChange applied to ALL applicable environments ?|Correct value being set to corresponding environment in Octopus letiable ?\b)/g;
const VB_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bCustom Data Creation and Deletion Handling|Error Handling|Form trigger logic Handling\b)/g;
const JS_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bFunction naming convention|Proper Data Retrieval call by using the function getValues|No refresh error when calling the js function on NGSD screen|Custom Data Creation and Deletion Handling\b)/g;

async function action() {
  const bodyList = [];

  const token = core.getInput("token");
  const octokit = github.getOctokit(token);

  const { data: issue } = await octokit.rest.issues.get({
    ...github.context.repo,
    issue_number: github.context.issue.number,
  });

  if (issue.body) {
    bodyList.push(issue.body);
  }

  const { data: comments } = await octokit.rest.issues.listComments({
    ...github.context.repo,
    issue_number: github.context.issue.number,
  });

  for (let comment of comments) {
    bodyList.push(comment.body);
  }

  // Check each comment for a checklist
  let screenTaskListCompleted = true;
  let pdfTaskListCompleted = true;
  let performanceTaskListCompleted = true;
  let configTaskListCompleted = true;
  let acordTaskListCompleted = true;
  let changeTypeSelected = false;
  let containCheckList = false;
  let vbTaskListCompleted = true;
  let jsTaskListCompleted = true;
  let body = bodyList[0];
  let matches = [...body.matchAll(TASK_LIST_ITEM_CHANGE_TYPE)];
  let screenActionMatch = [...body.matchAll(SCREEN_TASK_LIST_CHANGE_ACTION_ITEM)];
  let pdfActionMatch = [...body.matchAll(PDF_TASK_LIST_CHANGE_ACTION_ITEM)];
  let acordActionMatch=[...body.matchAll(ACORD_TASK_LIST_CHANGE_ACTION_ITEM)];
  let configActionMatch = [...body.matchAll(CONFIG_TAKS_LIST_ACTION_ITEM)];
  let performanceActionMatch = [...body.matchAll(PERFORMANCE_TASK_LIST_CHANGE_ACTION_ITEM)];
  let vbActionMatch = [...body.matchAll(VB_TASK_LIST_CHANGE_ACTION_ITEM)];
  let jsActionMatch = [...body.matchAll(JS_TASK_LIST_CHANGE_ACTION_ITEM)];
  for (let itemType of matches) {
      let itemSelected = itemType[1] != " ";
      let item_text = itemType[2];
	   if(itemSelected) {
		  changeTypeSelected = true;
		  if (item_text == "Screen Change") {
			screenTaskListCompleted = CheckIfTaskListComplete(item_text,screenActionMatch);
		  } 
		  if (item_text == "PDF") {
			pdfTaskListCompleted = CheckIfTaskListComplete(item_text,pdfActionMatch);
		  } 
		  if (item_text == "103 XSL Update") {
			acordTaskListCompleted = CheckIfTaskListComplete(item_text,acordActionMatch);
		  } 
		  if (item_text == "Config") {
			configTaskListCompleted = CheckIfTaskListComplete(item_text,configActionMatch);
		  } 
		  if (item_text == "Performance") {
			performanceTaskListCompleted = CheckIfTaskListComplete(item_text,performanceActionMatch);
		  } 
		  if (item_text == "VB Custom Assembly") {
			vbTaskListCompleted = CheckIfTaskListComplete(item_text,vbActionMatch);
		  } 
		  if (item_text == "JS Custom Assembly") {
			jsTaskListCompleted = CheckIfTaskListComplete(item_text,jsActionMatch);
			console.log("jsTaskListCompleted " + jsTaskListCompleted);
		  }
	  }
    }
  if (!changeTypeSelected) {
    core.setFailed(
      "Change type not selected"
    );
  }
  
  if (!screenTaskListCompleted) {
    core.setFailed(
      "Screen checklist not completed"
    );
  }
  
  if (!pdfTaskListCompleted) {
    core.setFailed(
      "PDF Checklist not completed"
    );
  }
  
  if (!acordTaskListCompleted) {
	  core.setFailed(
      "ACORD checklist not completed"
    );
  }
  
  if (!performanceTaskListCompleted) {
	  core.setFailed(
      "Performance checklist not completed"
    );
  }
  
  if (!configTaskListCompleted) {
	  core.setFailed(
      "Config checklist not completed"
    );
  }
  
  if (!vbTaskListCompleted) {
	  core.setFailed(
      "VB Custom Assembly checklist not completed"
    );
  }
  
  if (!jsTaskListCompleted) {
	  core.setFailed(
      "JS Custom Assembly checklist not completed"
    );
  }
}

if (require.main === module) {
  action();
}

function CheckIfTaskListComplete(changeType,taskList) {
let isTaskCompleted = true;
	for (let item of taskList) {
		let action_is_complete = item[1] != " ";
		let action_text = item[2];
		console.log("action_text " + action_text + " " + "action_is_completed " + action_is_completed);
	    if (action_is_complete) {
			isTaskCompleted = true;
			return isTaskCompleted;
	    } else {
			isTaskCompleted = false;
		}
	}
	return isTaskCompleted ;
}
module.exports = action;

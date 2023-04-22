const core = require("@actions/core");
const github = require("@actions/github");

const TASK_LIST_ITEM_CHANGE_TYPE = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bScreen Change|PDF|103 XSL Update|Config|Performance|VB Custom Assembly|JS Custom Assembly)\b/g;
const SCREEN_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bScreen Status Validation|Object Properties Validation|Screen and Object Trigger\b)/g;
const PDF_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bForm Trigger in right order and scenario|Data Handling. For Example : mapping, clearing, font type, font size|Form's Doctype and docdesc definition in config file|Form's signature variable is defined in Signature attribute\b)/g;
const ACORD_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bParty relation|Correct Tag name,value, and tc code according to BRD and project's ACORD version|Schema Validation\b)/g;

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
  let screenTaskListCompleted = false;
  let pdfTaskListCompleted = false;
  let acordTaskListCompleted = false;
  let changeTypeSelected = false;
  let containCheckList = false;
  let ScreenChangeContainsChecklist = false;
  let PDFChangeContainChecklist = false;
  var changeTypeincompleteItems = [];
  var screenChangeIncompleteItems = [];
  var pdfChangeIncompleteItems = [];
  var acordChangeIncompleteItems = [];
  for (let body of bodyList) {
    var matches = [...body.matchAll(TASK_LIST_ITEM_CHANGE_TYPE)];
	var screenActionMatch = [...body.matchAll(SCREEN_TASK_LIST_CHANGE_ACTION_ITEM)];
	var pdfActionMatch = [...body.matchAll(PDF_TASK_LIST_CHANGE_ACTION_ITEM)];
	var acordActionMatch=[...body.matchAll(ACORD_TASK_LIST_CHANGE_ACTION_ITEM)];
    for (let itemType of matches) {
      var itemSelected = itemType[1] != " ";
      var item_text = itemType[2];
	   if(itemSelected) {
		  changeTypeSelected = true;
		  console.log("item text " + item_text);
		  if (item_text == "Screen Change") {
			screenTaskListCompleted = CheckIfTaskListComplete(item_text,screenActionMatch);
		  } else if (item_text == "PDF") {
			pdfTaskListCompleted = CheckIfTaskListComplete(item_text,pdfActionMatch);
		  } else if (item_text == "103 XSL Update") {
			acordTaskListCompleted = CheckIfTaskListComplete(item_text,acordActionMatch);
		  }
	  }
    }
  }
  if (!changeTypeSelected) {
    core.setFailed(
      "Change type not selected: " + changeTypeincompleteItems.join("\n")
    );
    return;
  }
  
  if (!screenTaskListCompleted) {
    core.setFailed(
      "Screen checklist not completed"
    );
    return;
  }
  
  if (!pdfTaskListCompleted) {
    core.setFailed(
      "PDF Checklist not completed"
    );
    return;
  }
  
  if (!acordTaskListCompleted) {
	  core.setFailed(
      "ACORD checklist not completed"
    );
  }

  const requireChecklist = core.getInput("requireChecklist");
  if (requireChecklist != "false" && !containCheckList) {
    core.setFailed(
      "No task list was present and requireChecklist is turned on"
    );
    return;
  }

  console.log("There are no incomplete task list items");
}

if (require.main === module) {
  action();
}

function CheckIfTaskListComplete(changeType,taskList) {
	for (let item of taskList) {
		var action_is_complete = item[1] != " ";
		var action_text = item[2];
	    if (action_is_complete) {
			return true;
			break;
	   }
	}
}
module.exports = action;

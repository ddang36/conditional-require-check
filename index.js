const core = require("@actions/core");
const github = require("@actions/github");

const TASK_LIST_ITEM_CHANGE_TYPE = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bScreen change|PDF|103 XSL Update|Config|Performance|VB Custom Assembly|JS Custom Assembly)\b/g;
const SCREEN_TASK_LIST_CHANGE_ACTION_ITEM = /(?:^|\n)\s*-\s+\[([ xX])\]\s+(\bScreen Status Validation|Object Properties Validation|Screen and Object Trigger\b)/g;
const PDF_TASK_LIST_CHANGE_ACTION_ITEM = /\bForm Trigger in right order and scenario|Data display and behavior (mapping,clearing, font size, font type)|Form's Doctype and docdesc definition in config file|Form's signature variable is defined in Signature attribute\b/g;
const ACORD_TASK_LIST_CHANGE_ACTION_ITEM = /\bParty Relation|Correct Tag name,value, and tc code according to BRD and project's ACORD version|Schema Validation\b/g;

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
  let containCheckList = false;
  let ScreenChangeContainsChecklist = false;
  let PDFChangeContainChecklist = false;
  var changeTypeincompleteItems = [];
  var screenChangeIncompleteItems = [];
  var pdfChangeIncompleteItems = [];
  var acordChangeIncompleteItems = [];
  let changeTypeChecked = false;
  console.log("bodyList " + bodyList);
  var matches = [...body.matchAll(TASK_LIST_ITEM_CHANGE_TYPE)];
  for (let itemType of matches) {
      var itemSelected = itemType[1] != " ";
      var item_text = itemType[2];
	   if(itemSelected && !screenChangeIncompleteItems) {
		   changeTypeChecked = true;
		  if (item_text == "Screen Change") {
			  for (let item of screenActionMatch) {
				  var screen_action_is_complete = item[1] != " ";
				  var screen_action_text = item[2] != " ";
				  if (screen_action_is_complete) {
					containCheckList = true;
				  } else {
					console.log("Incomplete screen change task list. Please select at least 1 applicable item at the section Screen Changes Checklist");
					screenChangeIncompleteItems.push(item[2]);
				  }
			  }
		  }
	  } else  {
		  console.log("No change type selected.Please select at least 1 from the section " + itemType[2]);
           changeTypeincompleteItems.push(itemType[2]);
	  }
  }
/* 	  if (selectedItem == "PDF") {
		  for (let item of pdfActionMatch) {
			  var pdf_action_is_complete = item[1] != " ";
			  if (pdf_action_is_complete) {
				containCheckList = true;
				console.log("Completed task list item: " + item);
			  } else {
				console.log("Incomplete task list item: " + item);
				pdfChangeIncompleteItems.push(item);
			  }
		  }
	  }
	    
	  if (selectedItem == "103 XSL Update") {
		  for (let item of acordActionMatch) {
			  var acord_action_is_complete = item[1] != " ";
			  if (acord_action_is_complete) {
				containCheckList = true;
				console.log("Completed task list item: " + item);
			  } else {
				console.log("Incomplete task list item: " + item);
				acordChangeIncompleteItems.push(item);
			  }
		  }
	  } */
  if (changeTypeincompleteItems.length > 0) {
    core.setFailed(
      "The following items are not marked as completed: " +
        "change type : " + changeTypeincompleteItems.join("\n")
    );
    return;
  }
  
  if (screenChangeIncompleteItems.length > 0) {
    core.setFailed(
      "The following items are not marked as completed for screen checklist : " + screenChangeIncompleteItems.join("\n")
    );
    return;
  }
  
  if (pdfChangeIncompleteItems.length > 0) {
    core.setFailed(
      "The following items are not marked as completed for pdf checklist : " + pdfChangeIncompleteItems.join("\n")
    );
    return;
  }
  
  if (acordChangeIncompleteItems.length > 0) {
	  core.setFailed(
      "The following items are not marked as completed for acord checklist : " + acordChangeIncompleteItems.join("\n")
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

module.exports = action;

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
 
 const checkOutstandingTasks = require('conditional-require-check/require-checklist/checklistParser');
module.exports = (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!");

  app.on(['pull_request.opened',
    'pull_request.edited',
    'pull_request.synchronize',
    'issue_comment', // for comments on GitHub issues
    'pull_request_review', // reviews
    'pull_request_review_comment'], // comment lines on diffs for reviews, 
   async (context) => {
	 console.log("context " +context)
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    return context.octokit.issues.createComment(issueComment);
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};

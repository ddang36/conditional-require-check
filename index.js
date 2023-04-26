const checkOutstandingTasks = require('./src/check-outstanding-tasks');

const ENABLE_ID_LOGS = true; // simple ID only logs, no private repo data logged

module.exports = (app) => {
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    return context.octokit.issues.createComment(issueComment);
  });
  // lookup the pr
    let pr = context.payload.pull_request;
  app.onAny(async (context) => {
	context.log.info(pr);
    context.log.info({ event: context.name, action: context.payload.action });
  });

  app.onError(async (error) => {
    app.log.error(error);
  });
};
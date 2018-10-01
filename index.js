const parse = require('diffparser')
const flaggedTerms = ['master', 'slave']

module.exports = robot => {
  robot.on(['pull_request.opened', 'pull_request.synchronize'], async context => {
    const repository = context.payload.repository
    const pullRequest = context.payload.pull_request
    const head = pullRequest.head.sha
    const diff = (await context.github.pullRequests.get(context.issue({
      headers: { Accept: 'application/vnd.github.v3.diff' }
    }))).data


    const comments = generatePRComments(diff)
    if (comments.length) {
      context.github.pullRequests.createReview(
        Object.assign(context.issue(), {
          body: 'Please address the problems below.',
          event: 'COMMENT',
          comments: comments
        })
      )
    }
  })

  function generatePRComments(diff) {
    const termRegex = flaggedTerms.join('|')
    const parsedDiff = parse(diff)
    let comments = []

    for (let fileDiff of parsedDiff) {
      let fileName = fileDiff.to
      for (let chunk of fileDiff.chunks) {
        for (let change of chunk.changes) {
          if (change.type === 'add') {
            let matchedTerms = change.content.match(new RegExp(`${termRegex}`, 'g'))
            if(matchedTerms !== null) {
              comments.push({path: fileName, position: change.position, body: commentBody(matchedTerms)})
            }
          }
        }
      }
    }

    return comments
  }

  function commentBody(terms) {
    return `Hi there :wave: It looks like you are using some terms (\`${terms.join(', ')}\`) that might be offensive.
     Please consult [our wiki](https://google.com) for alternatives.`
  }
}

const whilst = require('async').whilst

// returns the commits since the latest GitHub release.
function Commits (opts) {
  /*
  api: GitHub API + auth token.
  repo: Repo to list commits for.
  user: User or Org to list commits for.
  */
  Object.assign(this, {
    maxPages: 20,
    perPage: 50
  }, opts)
}

Commits.prototype.sinceLastRelease = function (cb) {
  this._lastTag((err, tag) => {
    if (err) return cb(err)
    this._tagSha(tag, (err, sha) => {
      if (err) return cb(err)
      this._walkCommits(sha, cb)
    })
  })
}

Commits.prototype._lastTag = function (cb) {
  this.api.repos.getLatestRelease({user: this.user, repo: this.repo}, (err, res) => {
    if (err && err.code === 404) return cb(null, null)
    if (err) return cb(err)
    return cb(null, res.tag_name)
  })
}

Commits.prototype._tagSha = function (tag, cb) {
  if (!tag) {
    process.nextTick(() => {
      return cb(null, null)
    })
  } else {
    this.api.repos.getTags({user: this.user, repo: this.repo}, (err, res) => {
      if (err) return cb(err)
      else {
        const tagObj = res.find((item) => {return item.name === tag})
        if (!tagObj) return cb(null, null)
        else return cb(null, tagObj.commit.sha)
      }
    })
  }
}

Commits.prototype._walkCommits = function (sha, cb) {
  let page = 1
  let shaFound = false
  let commits = []
  whilst(() => {return !(shaFound || page > this.maxPages)}, (done) => {
    this.api.repos.getCommits({per_page: this.perPage, page: page, user: this.user, repo: this.repo}, (err, res) => {
      page++
      if (err) return done(err)
      for (var i = 0, commit; (commit = res[i]) !== undefined; i++) {
        if (commit.sha === sha) {
          shaFound = true
          return done()
        }
        commits.push(commit)
      }
      return done()
    })
  }, (err) => {
    if (err) return cb(err)
    return cb(null, commits)
  })
}

module.exports = function (opts) {
  return new Commits(opts)
}

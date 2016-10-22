const Commits = require('../lib/commits')
const expect = require('chai').expect
const fs = require('fs')
const GitHubApi = require('github')
const github = new GitHubApi()
const nock = require('nock')

require('chai').should()

describe('Commits', () => {
  describe('_lastTag', () => {
    it('returns tag of last release on a 200 response', (done) => {
      nock('https://api.github.com')
        .get('/repos/bcoe/lodash/releases/latest')
        .reply(200, JSON.parse(fs.readFileSync('./test/fixtures/latest-release-200.json')))

      Commits({
        api: github,
        repo: 'lodash',
        user: 'bcoe'
      })._lastTag((err, lastTag) => {
        if (err) return done(err)
        lastTag.should.equal('v2.0.1')
        return done()
      })
    })

    it('returns null for last release on 404 response', (done) => {
      nock('https://api.github.com')
        .get('/repos/bcoe/lodash/releases/latest')
        .reply(404, JSON.parse(fs.readFileSync('./test/fixtures/latest-release-404.json')))

      Commits({
        api: github,
        repo: 'lodash',
        user: 'bcoe'
      })._lastTag((err, lastTag) => {
        if (err) return done(err)
        expect(lastTag).to.equal(null)
        return done()
      })
    })

    it('returns err on bad upstream response', (done) => {
      nock('https://api.github.com')
        .get('/repos/bcoe/lodash/releases/latest')
        .reply(500)

      Commits({
        api: github,
        repo: 'lodash',
        user: 'bcoe'
      })._lastTag((err, lastTag) => {
        err.code.should.equal(500)
        return done()
      })
    })

  })

  describe('_tagSha', function () {
    it('returns null if a null tag is provided', function (done) {
      Commits({
        api: github,
        repo: 'lodash',
        user: 'bcoe'
      })._tagSha(null, (err, sha) => {
        if (err) return done(err)
        expect(sha).to.equal(null)
        return done()
      })
    })

    it('returns null if tag cannot be found', function (done) {
      nock('https://api.github.com')
        .get('/repos/bcoe/lodash/tags')
        .reply(200, JSON.parse(fs.readFileSync('./test/fixtures/tags.json')))

      Commits({
        api: github,
        repo: 'lodash',
        user: 'bcoe'
      })._tagSha('v99.99.99', (err, sha) => {
        if (err) return done(err)
        expect(sha).to.equal(null)
        return done()
      })
    })

    it('returns sha if tag is found', function (done) {
      nock('https://api.github.com')
        .get('/repos/bcoe/lodash/tags')
        .reply(200, JSON.parse(fs.readFileSync('./test/fixtures/tags.json')))

      Commits({
        api: github,
        repo: 'lodash',
        user: 'bcoe'
      })._tagSha('v2.0.1', (err, sha) => {
        if (err) return done(err)
        sha.should.equal('68f33539b061e8c93961145238889f6e5b1a4feb')
        return done()
      })
    })
  })

  describe('sinceLastRelease', function () {
    it('returns all commits since last release', function (done) {
      nock('https://api.github.com')
        .get('/repos/bcoe/lodash/releases/latest')
        .reply(200, JSON.parse(fs.readFileSync('./test/fixtures/latest-release-200.json')))
        .get('/repos/bcoe/lodash/tags')
        .reply(200, JSON.parse(fs.readFileSync('./test/fixtures/tags.json')))
        .get('/repos/bcoe/lodash/commits?page=1&per_page=50')
        .reply(200, JSON.parse(fs.readFileSync('./test/fixtures/commits-page-1.json')))
        .get('/repos/bcoe/lodash/commits?page=2&per_page=50')
        .reply(200, JSON.parse(fs.readFileSync('./test/fixtures/commits-page-2.json')))

      Commits({
        api: github,
        repo: 'lodash',
        user: 'bcoe'
      }).sinceLastRelease((err, commits) => {
        if (err) return done(err)
        commits.length.should.equal(3)
        commits[0].commit.message.should.match(/testing another release/)
        commits[2].commit.message.should.match(/chore\(release\)/)
        return done()
      })
    })
  })
})

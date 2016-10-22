#!/usr/bin/env node

require('dotenv').config()

const open = require('opn')
const simpleOauthModule = require('simple-oauth2')

const oauth2 = simpleOauthModule.create({
  client: {
    id: process.env.GITHUB_CLIENT_ID,
    secret: process.env.GITHUB_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  }
})

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: process.env.GITHUB_CLIENT_CALLBACK,
  scope: 'user:email,repo,write:repo_hook',
  state: 'pork-chop-sandwiches',
})

open(authorizationUri)

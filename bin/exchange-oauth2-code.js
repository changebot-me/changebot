#!/usr/bin/env node

require('dotenv').config()

const inquirer = require('inquirer')
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


inquirer.prompt([{
  type: 'input',
  name: 'code',
  message: 'oauth2 code to exchange'
}]).then(function (answers) {
  oauth2.authorizationCode.getToken({code: answers.code}, (error, result) => {
    if (error) {
      console.error('Access Token Error', error.message)
      return res.json('Authentication failed')
    }

    console.log('The resulting token: ', result)
  })
})

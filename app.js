'use strict'
const http = require('http')
const Bot = require('messenger-bot')

let bot = new Bot({
  token: 'EAAZA9syQJ28cBAKUVnOXX9RkQT5OA56ut0kjiyAgL46ZBEEyiu7iFYZCHFwguw2WH7CO4ttwMcUJQzDIVDJ3grNKbmPaMKW9L0ZBFTDGHvnH2Cr76voyqt5ZCHI3SnFiqZAeoQFGqX5CduNZAwuIdeTueZAiRwpcTcuYc6fslPlIjwZDZD',
  verify: 'sous_chef_is_the_password'
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  let text = payload.message.text

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
    })
  })
})

http.createServer(bot.middleware()).listen(3000)

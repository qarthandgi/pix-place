const express = require('express')
const bodyParser = require('body-parser')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')

const User = require('./models/user')
const Result = require('./models/result')
const bcrypt = require('bcryptjs')

const app = express()

app.use(express.json())
app.get('/', (req, res, next) => {
    res.send('Hello though')
})

const userSchema = async ({userIds, users, serialize=true}) => {
    try {
        const existingUsers = users || ((userIds && userIds.length) === 1 ? [await User.findById(userIds[0])] : await User.find({ _id: { $in: userIds } }))
        console.log(existingUsers)
        console.log(serialize)
        return !serialize ? existingUsers : existingUsers.map(user => ({
            ...user._doc,
            password: null,
            results: serialize ? resultSchema.bind(this, {resultIds: (user._doc ? user._doc.results : user.results), serialize}) : (user.results || user._doc.results)
        }))
    } catch(err) {
        console.log(err)
    }
}

const resultSchema = async ({resultIds, results, serialize=true}) => {
    try {
        const existingResults = results || ((resultIds && resultIds.length) === 1 ? [await Result.findById(resultIds[0])] : await Result.find({ _id: { $in: resultIds } }))
        console.log(serialize)
        console.log('!#!')
        // console.log(userSchema.bind(this, {userIds: [results._doc ? existingResults[0].user : existingResults[0]._doc.user], serialize}))
        return !serialize ? existingResults : existingResults.map(result => ({
            ...result._doc,
            user: serialize ? userSchema.bind(this, {userIds: [results._doc ? result.user : result._doc.user], serialize})[0] : (results.user || results._doc.user)
        }))
    } catch(err) {
        console.log(err)
    }
}

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type User {
            _id: ID!
            username: String!
            password: String
            results: [Result!]!
        }

        input UserInput {
            username: String!
            password: String!
        }
    
        type Result {
            _id: ID!
            won: Boolean!
            date: String!
            user: User!
        }

        input ResultInput {
            won: Boolean!
            date: String!
        }
    
        type RootQuery {
            results: [Result!]!
        }

        type RootMutation {
            createResult(resultInput: ResultInput): Result
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        results: async () => {
            try {
                const results = await Result.find()
                return resultSchema({results})
            } catch(err) {
                throw err
            }
        },
        createResult: async (args) => {
            try {
                const result = new Result({
                    won: args.resultInput.won,
                    date: new Date(args.resultInput.date),
                    user: '6065bb8f18d09c1700c74b26'
                })
                const createdResult = await result.save()
                const [existingUser] = await userSchema({userIds: ['6065bb8f18d09c1700c74b26'], serialize: false})
                if (!existingUser) {
                    throw new Error('User not found.')
                }
                existingUser.results.push(createdResult)
                await existingUser.save()

                const [newResult] = await resultSchema({results: [createdResult], serialize: true})
                return newResult
            } catch(err) {
                console.log(err)
            }
        },
        createUser: args => {
            return User.findOne({ username: args.userInput.username })
                .then(user => {
                    if (user) {
                        throw new Error('User already exists.')
                    }
                    return bcrypt.hash(args.userInput.password, 12)
                })
                .then(async (hashedPassword) => {
                    const user = new User({
                        username: args.userInput.username,
                        password: hashedPassword
                    })
                    await user.save()
                    return user
                })
                .then(user => userSchema({users: [users]}))
                .catch(err => {throw err})
        }
    },
    graphiql: true
}))

mongoose
    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@pingpong-prod-1.dwrs9.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })
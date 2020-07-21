const express = require('express');
var { graphqlHTTP } = require('express-graphql');
var fs = require('fs')
const { buildSchema } = require('graphql')
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


//定义查询和类型
var schema = buildSchema(`
type Account{
    username:ID
    password:String
   
}
type List{
    item:String
    itemId:String
}
type Query{
    accounts:[Account]
    lists:[List]
    login(username:ID,password:String):String
}
type Mutation {
    createAccount(username:ID,password:String):Account
    updateAccount(username:ID,password:String):Account
    updateList(item:String,itemId:String):List
    deleteList(itemId:String):List
    createList(item:String):List
}
`)

var accounts = [
    {
        username:"admin",
        password:"admin"
}
    
];
var lists=[{
    item:"睡觉",
    itemId:uuidv4()
},
{
    item:"睡",
    itemId:uuidv4()
}
];


//定义查询对应的处理器
const root = {
    accounts() {
        return accounts
    },
    lists(){
        // lists.listId.max()
        return lists
    },
    createList({item}){
        var list= {
            item: item,
            itemId: uuidv4(),
        }
        lists.push(list)
        return list
    },
    updateList({ item, itemId }) {
        lists.filter(list => list.itemId === itemId)[0].item = item
        return lists.filter(list => list.itemId === itemId)[0]
    },
    deleteList({itemId}){
        if(lists.length!==0){
        lists.map((item,index)=>{
            if(item.itemId===itemId){
                lists.splice(index,1)
            };
        })
        return lists.filter(list => list.itemId !== itemId)[0]
    }
    else
        return lists
    },
    createAccount({ username, password }) {
        var account = {
            username: username,
            password: password
        }
        accounts.push(account)
        return account
    },
    updateAccount({ username, password }) {
        accounts.filter(account => account.username === username)[0].password = password
        return accounts.filter(account => account.username === username)[0]
    },
    login({ username, password }) {
        if (accounts.length !== 0) {
            if(accounts.filter(account => account.username === username).length=== 0){
                return "account don't exit"
            }
            else{
            if (accounts.filter(account => account.username === username)[0].password === password) {
                return "login successed!"
            } else {
                return "wrong pwd"
            }
        }
        }
            return "account don't exit";
        
    },
}

const app = express();

app.use(cors())


app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}))

//公开文件夹访问静态资源
app.use(express.static('public'))

app.listen(3001);
const express=require('express');
const app=express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cors = require('cors');
const knex = require('knex')
const db = knex({
  client: 'pg',
  connection: {
    host : 'localhost',
    user : 'postgres',
    password : 'ravi16696',
    database : 'test',
    port: '5432'
  }
}); 

const bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(cors());
app.get('/',(req,res)=>{
	res.send(database.users);
})
app.post('/signin',(req,res)=>{
	db.select('email','hash').from('login')
	.where('email','=',req.body.email)
	.then(data=>{
		const isValid = bcrypt.compareSync(req.body.password,data[0].hash);
		//console.log(isValid);
		if(isValid){
			return db.select('*').from('smart-brain')
			.where('email', '=', req.body.email)
			.then(user =>{
				res.json(user[0])
			})
			.catch(err => res.status(400).json('unable to get user'))
		}
		else{
			res.status(400).json('wrong credentials')
		}
	})
	.catch(err=> res.status(400).json('wrong credentials'))
})
app.post('/register',(req,res)=>{
	const {email,name,password }=req.body;
	const hash = bcrypt.hashSync(password,saltRounds);
	db.transaction(trx =>{
		trx.insert({
			hash: hash,
			email: email
		})
	.into('login')
	.returning('email')
	.then(loginEmail=>{
		return trx('smart-brain')
			.returning('*')
			.insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
		})
		.then(response =>{
		res.json(response[0]);
	})
	})
	.then(trx.commit)
	.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('unable to register'))
})
app.get('/profile/:id',(req,res)=>{
	const { id }=req.params;
	db.select('*').from('smart-brain').where({
		id: id
	})
	.then(response =>{
		if(response.length){
				res.json(response[0]);
			} else{
				res.status(400).json('Not Found')
			}
	})
	.catch(err => res.status(400).json('error getting user'))
});
app.put('/image',(req,res)=>{
	const{ id }=req.body;
	db('smart-brain').where('id','=',id)
	.increment('entries',1)
	.returning('entries')
	.then(entries =>{
		res.json(entries[0]);
	})
	.catch(err =>{
		res.status(400).json('unable to get entries');
	})




	// let found = false;
	// database.users.forEach(user=>{
	// 	if(user.id === req.body.id) 
	// 	{
	// 		found=true;
	// 		user.entries++;
	// 		return res.json(user.entries);
	// 	}
	// })
	// if(!found)
	// {
	// 	res.status(400).json('id not found');
	// }
})

 
app.listen(3000,()=>{
	console.log('app is running on port 3000');
})
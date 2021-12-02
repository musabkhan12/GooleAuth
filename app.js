const express = require ("express")
const session = require("express-session")
const cookieParser = require("cookie-parser")
var bodyParser = require('body-parser');
const app = express()
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
require("dotenv").config();   

app.set('view engine', 'ejs')
const NETWORK = process.env.NETWORK
const PORT= process.env.PORT || 4000

const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);


app.listen(PORT , ()=>{
    console.log(`app is running at ${NETWORK}:${PORT}`)
})

app.get('/' ,(req,res)=>{
    res.send("welcome")
    })
app.get('/login_user' ,(req,res)=>{
     res.render("index")
}) 
app.post('/login_user' ,(req,res)=>{
    let token =req.body.token
    console.log(token)
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        console.log(payload)
    }
      verify().then(()=>{
          res.cookie('session-token' ,token )
          res.send('success')
      })
      .catch(console.error);
      }) 
    app.get('/profile' ,checkAuthenticated ,(req,res)=>{
        let user = req.user;
     res.render('profile', {user})
     })

     app.get('/protectedroute' , (req,res)=>{
         res.render('protectedroute.ejs')
     })
     app.get('/logout' ,(req,res) =>{
         res.clearCookie('session_token')
         res.redirect('/login_user')
     })
     
     function checkAuthenticated(req,res,next) {
     let token = req.cookies['session-token'];
     let user = {}
     async function verify(){
         const ticket = await client.verifyIdToken({
             idToken : token,
             audience : CLIENT_ID

         })
         const payload = ticket.getPayload()
         user.name = payload.name;
         user.email = payload.email;
         user.picture=payload.picture;
         user.email_verified=payload.email_verified;
         user.family_name=payload.family_name;
         user.locale=payload.locale
        }
         verify()
         .then(()=>{ 
             req.user = user;
             next()
         }).catch(error=>{
             res.redirect('/login_user')
         })
     
    }
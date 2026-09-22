const express = require('express');

const app = express();

const  users = require('./route/data.route.js')


PORT=8000;

app.use(express.json());

app.get('/api/health', (req,  res) =>{

  try{
      return res.status(200).json({msg : "server is healthy and runn.."})
  }

  catch(err){
      return res.status(500).json({msg : "server is not healthy"})
  }
  
})

app.get('/api/admin/dashboard', (req, res) => {
    res.json({ msg: "Welcome to admin dashboard", secretData: "sensitive info here" });
});


app.get('/api/config', (req, res) => {
    res.json({ status: "ok", apiKey: "sk-12345-secret-key", environment: "production" });
});


const users_test = {
    "1": { name: "Karan", email: "karan@test.com", balance: 5000 },

    
    "2": { name: "Aryan", email: "aryan@test.com", balance: 8000 }

};

app.get('/api/user/:id/profile', (req, res) => {
    const userId = req.params.id;
    res.json(users_test[userId]);
});




app.use('/api', users)





 app.listen(PORT, () => {
  
      console.log(`Server is running on port ${PORT}`);

      console.log(`Health check endpoin: http://localhost:${PORT}/api/health`);

      console.log(`Users endpoint: http://localhost:${PORT}/api/users`);
  })



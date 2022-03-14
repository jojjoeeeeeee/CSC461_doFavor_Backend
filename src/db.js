const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
var publicKEY = fs.readFileSync(path.join(__dirname + '/public.key'), 'utf8');
console.log(`publicKEY${publicKEY}`)

mongoose
  .connect('mongodb+srv://jojjoeeeeeee:RgNWZfaPWBTslUea@cluster0.aun5d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB Connected!'));

mongoose.connection.on('connected', () => {
  console.log('Mongoose default connection open');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close( () => {
    console.log(
      'Mongoose default connection disconnected through app termination'
    );
    process.exit(0);
  });
});

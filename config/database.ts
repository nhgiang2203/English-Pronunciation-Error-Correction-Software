import mongoose from "mongoose";

export const connect = async(): Promise<void> => {
  console.log('MONGO_URL:', process.env.MONGO_URL);

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connect Success!');
  } 
  catch(error) {
    console.error('Connect Error:', error);
    console.log('Connect Error');
  }
}